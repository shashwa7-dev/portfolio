/**
 * Vendored from Ink Folio (portrait.html), the generative portrait engine
 * behind app/blogs/posts/drawing-faces-with-code.mdx.
 *
 * Section 4, "the hand", derives from cyber-crowd by Kevin Ngo, MIT licensed.
 * See LICENSE-cyber-crowd.md beside this file. Do not strip that notice.
 *
 * Wrapped rather than rewritten. The renderer's 202 canvas calls reference a
 * bare `ctx`, and its ink registers (CUR_INK, INK_BOOST, DETAIL) are mutated
 * mid-render. Making those locals of this closure gives every instance its own
 * state without editing a single drawing call, which is why this file is a
 * faithful copy and not a port. Two engines on one page cannot see each other,
 * which the issue gallery depends on.
 *
 * There is deliberately no singleton and no default instance. Each caller
 * creates its own.
 */
export function createEngine(ctx, opts = {}) {
  let CUR_INK, INK_BOOST, DETAIL;   // hoisted out of the vendored body

  // ---- BEGIN VENDORED SOURCE (portrait.html lines 59-1578) ----
  // (line 59, not the brief's line 60: TAU is declared there and is used by
  // sections 3-7. Without it every portrait() throws "TAU is not defined".)
  const TAU = Math.PI*2;

  /* ============================ 1. seeding ============================ */

  // FNV-1a + avalanche. "shashwa7" always lands on the same person, forever.
  function hashStr(str){
    let h = 2166136261 >>> 0;
    for(let i=0;i<str.length;i++){ h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    h ^= h>>>13; h = Math.imul(h, 0x5bd1e995); h ^= h>>>15;
    return h>>>0;
  }
  // a second, independent stream from the same name (paper vs person)
  const hashWith = (str, salt) => hashStr(salt + ' ' + str);

  function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
  const rr = (R,a,b) => a + R()*(b-a);
  const ri = (R,a,b) => Math.floor(rr(R,a,b+1));
  const chance = (R,p) => R() < p;
  function weighted(R, pairs){
    let t=0; for(const p of pairs) t+=p[1];
    let x=R()*t;
    for(const p of pairs){ if((x-=p[1])<0) return p[0]; }
    return pairs[pairs.length-1][0];
  }
  const pick = (R,arr) => arr[(R()*arr.length)|0];
  const smooth = v => v<=0?0 : v>=1?1 : v*v*(3-2*v);

  /* ============================ 2. palette ============================ */

  const PAPER = '#f6f1e5';
  const PR = [246,241,229];
  const INK = [31,29,26];
  CUR_INK = INK;
  INK_BOOST = 1;
  DETAIL = 1;                   // scales crumb + accident counts with portrait size

  const inkA = a => `rgba(${CUR_INK[0]},${CUR_INK[1]},${CUR_INK[2]},${Math.min(1, a*INK_BOOST)})`;
  const colA = (c,a) => `rgba(${c[0]},${c[1]},${c[2]},${Math.min(1, a*INK_BOOST)})`;
  const paperA = a => `rgba(${PR[0]},${PR[1]},${PR[2]},${a})`;

  // warmer than the reference: less slate, more clay and sage
  const HALOC  = [[172,178,158],[186,190,203],[198,192,205],[190,181,164],[181,195,201],
                  [206,183,175],[158,164,142],[218,211,190],[200,186,168]];
  const SKINC  = [[138,93,66],[164,113,79],[192,138,92],[176,107,62],[227,201,160],
                  [217,169,143],[156,136,120],[221,198,135],[203,158,120]];
  const HAIRCOL= [[170,96,48],[180,150,72],[92,132,120],[96,106,142],[140,96,88],[124,124,84]];
  const ACCENTC= [[168,72,60],[86,130,120],[178,134,58],[120,104,146]];
  // Masks get their own box of colour — more saturated than the rest of the
  // palette, because a mask is allowed to shout. null means classic graphite.
  const HEROC  = [[168,72,60],[72,86,138],[58,122,116],[116,84,140],[190,146,58],
                  [86,116,74],[156,54,70],[96,112,150],[196,104,52],[62,96,132]];
  const BLUSHC = [208,148,140];

  /* ============================ 3. geometry ============================ */

  function resample(pts, step){
    const out=[[pts[0][0],pts[0][1]]];
    let need=step;
    for(let i=1;i<pts.length;i++){
      let x0=pts[i-1][0], y0=pts[i-1][1];
      const x1=pts[i][0], y1=pts[i][1];
      let d=Math.hypot(x1-x0,y1-y0);
      while(d>=need && d>0){
        const t=need/d;
        x0+=(x1-x0)*t; y0+=(y1-y0)*t;
        out.push([x0,y0]);
        d=Math.hypot(x1-x0,y1-y0);
        need=step;
      }
      need-=d;
    }
    const last=pts[pts.length-1], le=out[out.length-1];
    if(Math.hypot(last[0]-le[0],last[1]-le[1])>step*.25) out.push([last[0],last[1]]);
    return out;
  }
  function chaikin(pts, closed, it){
    while(it-->0){
      const out=[], n=pts.length;
      if(!closed) out.push(pts[0]);
      const end = closed ? n : n-1;
      for(let i=0;i<end;i++){
        const a=pts[i], b=pts[(i+1)%n];
        out.push([a[0]*.75+b[0]*.25, a[1]*.75+b[1]*.25],[a[0]*.25+b[0]*.75, a[1]*.25+b[1]*.75]);
      }
      if(!closed) out.push(pts[n-1]);
      pts=out;
    }
    return pts;
  }
  function poly(pts, close){
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    for(let i=1;i<pts.length;i++) ctx.lineTo(pts[i][0], pts[i][1]);
    if(close) ctx.closePath();
  }
  function circlePts(cx,cy,rx,ry,n=22,rot=0){
    const pts=[];
    for(let i=0;i<n;i++){
      const t=i/n*TAU;
      const x=Math.cos(t)*rx, y=Math.sin(t)*ry;
      pts.push([cx + x*Math.cos(rot)-y*Math.sin(rot), cy + x*Math.sin(rot)+y*Math.cos(rot)]);
    }
    return pts;
  }
  function arcPts(cx,cy,rx,ry,a0,a1,n=16){
    const pts=[];
    for(let i=0;i<=n;i++){
      const t=a0+(a1-a0)*i/n;
      pts.push([cx+Math.cos(t)*rx, cy+Math.sin(t)*ry]);
    }
    return pts;
  }
  function bbox(pts){
    let x0=Infinity,y0=Infinity,x1=-Infinity,y1=-Infinity;
    for(const p of pts){
      if(p[0]<x0)x0=p[0]; if(p[0]>x1)x1=p[0];
      if(p[1]<y0)y0=p[1]; if(p[1]>y1)y1=p[1];
    }
    return [x0,y0,x1,y1];
  }
  function offsetPath(pts, d){
    const out=[];
    for(let i=0;i<pts.length;i++){
      const a=pts[Math.max(0,i-1)], b=pts[Math.min(pts.length-1,i+1)];
      let nx=-(b[1]-a[1]), ny=b[0]-a[0];
      const dd=Math.hypot(nx,ny)||1;
      out.push([pts[i][0]+nx/dd*d, pts[i][1]+ny/dd*d]);
    }
    return out;
  }

  /* ==================== 4. the hand (cyber-crowd, MIT) ====================
     Not one line of this knows what a face is. It is the whole reason the
     output reads as pencil rather than as vector, and it will serve medals,
     frames and lettering exactly as well as it serves portraits.
     ====================================================================== */

  function stroke(R, pts, w, o={}){
    const alpha = o.alpha ?? rr(R,.68,.97);
    const amp = o.amp ?? (w*.5 + .9);
    const taper = o.taper ?? .22;
    if(o.over){
      // overshoots veer off-axis, the way a flick of the wrist does
      pts = pts.slice();
      const a=pts[0], b=pts[1];
      const d0=Math.hypot(b[0]-a[0],b[1]-a[1])||1;
      const f0=o.over*rr(R,-.5,.5);
      pts[0]=[a[0]-(b[0]-a[0])/d0*o.over - (b[1]-a[1])/d0*f0,
              a[1]-(b[1]-a[1])/d0*o.over + (b[0]-a[0])/d0*f0];
      const y=pts[pts.length-1], z=pts[pts.length-2];
      const d1=Math.hypot(y[0]-z[0],y[1]-z[1])||1;
      const f1v=o.over*rr(R,-.5,.5);
      pts[pts.length-1]=[y[0]+(y[0]-z[0])/d1*o.over - (y[1]-z[1])/d1*f1v,
                         y[1]+(y[1]-z[1])/d1*o.over + (y[0]-z[0])/d1*f1v];
    }
    const rs = resample(pts, Math.max(2.2, w*.9));
    const n = rs.length;
    if(n<3){
      ctx.strokeStyle=inkA(alpha); ctx.lineWidth=w; ctx.lineCap='round';
      poly(pts,false); ctx.stroke();
      return;
    }
    const p1=rr(R,0,7),p2=rr(R,0,7),p3=rr(R,0,7),p4=rr(R,0,7);
    const f1=rr(R,1.5,3.5),f2=rr(R,5,9),f3=rr(R,11,17);
    const L=[], Rt=[], C=[];
    for(let i=0;i<n;i++){
      const t=i/(n-1);
      const a=rs[Math.max(0,i-1)], b=rs[Math.min(n-1,i+1)];
      let nx=-(b[1]-a[1]), ny=b[0]-a[0];
      const d=Math.hypot(nx,ny)||1;
      nx/=d; ny/=d;
      const off = amp*(.55*Math.sin(t*f1*2+p1)+.3*Math.sin(t*f2+p2)+.15*Math.sin(t*f3+p3));
      const px=rs[i][0]+nx*off+rr(R,-.35,.35), py=rs[i][1]+ny*off+rr(R,-.35,.35);
      let half = w/2 * (o.wedge ? (.25+.95*t) : (.3+.7*smooth(Math.min(t,1-t)/taper)))
                     * (1+.38*Math.sin(t*7.3+p4)+.14*Math.sin(t*19+p2)) * rr(R,.88,1.14);
      half = Math.max(half, .28);
      L.push([px+nx*half, py+ny*half]);
      Rt.push([px-nx*half, py-ny*half]);
      C.push([px,py,nx,ny,half]);
    }
    // the graphite core
    ctx.beginPath();
    ctx.moveTo(L[0][0],L[0][1]);
    for(let i=1;i<n;i++) ctx.lineTo(L[i][0],L[i][1]);
    for(let i=n-1;i>=0;i--) ctx.lineTo(Rt[i][0],Rt[i][1]);
    ctx.closePath();
    ctx.fillStyle=inkA(alpha*.62);
    ctx.fill();
    // dry granulation: graphite crumbs across and past the stroke,
    // and paper biting back into its edges — nothing stays smooth
    if(w>=1.2){
      for(const [px,py,nx,ny,half] of C){
        const nd=Math.min(5, Math.max(1, Math.round(half*1.5*DETAIL)));
        for(let k=0;k<nd;k++){
          if(chance(R,.3)) continue;
          const u=rr(R,-1.05,1.05);
          const sz=rr(R,.7,1.5)+(half>2?.4:0);
          ctx.fillStyle=inkA(alpha*rr(R,.2,.55));
          ctx.fillRect(px+nx*half*u+rr(R,-.7,.7)-sz/2, py+ny*half*u+rr(R,-.7,.7)-sz/2, sz, sz);
        }
        if(chance(R,.45)){
          const u=(chance(R,.5)?1:-1)*rr(R,.8,1.15);
          const sz=rr(R,.9,2);
          ctx.fillStyle=paperA(rr(R,.4,.8));
          ctx.fillRect(px+nx*half*u-sz/2, py+ny*half*u-sz/2, sz, sz);
        }
      }
    }
    if(o.ghost && chance(R,.6)){
      stroke(R, pts, w*.45, {alpha:alpha*.2, amp:amp*1.9, taper});
      if(chance(R,.3)) stroke(R, pts, w*.35, {alpha:alpha*.12, amp:amp*2.6, taper});
    }
  }
  function broken(R, pts, w, o={}){
    const n=pts.length;
    if(n<10){ stroke(R,pts,w,o); return; }
    const segs=ri(R,2,3);
    for(let i=0;i<segs;i++){
      const a=Math.max(0, Math.floor(n*i/segs - n*.05));
      const b=Math.min(n, Math.floor(n*(i+1)/segs + n*.09));
      stroke(R, pts.slice(a,b), w*rr(R,.6,1.3),
             {...o, alpha:(o.alpha ?? rr(R,.68,.97))*rr(R,.75,1.05),
              over: (i===0 || i===segs-1) ? o.over : w*rr(R,0,2)});
    }
  }
  function sline(R, pts, w, alpha, color){
    const rs = resample(pts, 3);
    const p1=rr(R,0,7), p2=rr(R,0,7), f=rr(R,4,9);
    ctx.beginPath();
    let lift=false;
    for(let i=0;i<rs.length;i++){
      const t=i/(rs.length-1||1);
      const a=rs[Math.max(0,i-1)], b=rs[Math.min(rs.length-1,i+1)];
      let nx=-(b[1]-a[1]), ny=b[0]-a[0];
      const d=Math.hypot(nx,ny)||1;
      const off=(w*.55+.5)*(.6*Math.sin(t*f+p1)+.4*Math.sin(t*f*2.7+p2));
      // tremor on top of the wobble; sometimes the pen leaves the paper
      const x=rs[i][0]+nx/d*off+rr(R,-.45,.45), y=rs[i][1]+ny/d*off+rr(R,-.45,.45);
      if(!i || lift) ctx.moveTo(x,y); else ctx.lineTo(x,y);
      lift = chance(R,.035);
    }
    ctx.strokeStyle = color || inkA(Math.min(1, alpha*1.3));
    ctx.lineWidth=w*rr(R,.75,1.3); ctx.lineCap='round'; ctx.lineJoin='round';
    ctx.stroke();
    if(!color && w>=1.3){
      for(let i=0;i<rs.length;i+=2){
        if(chance(R,.55)) continue;
        const sz=rr(R,.6,1.2);
        ctx.fillStyle = chance(R,.7) ? inkA(alpha*rr(R,.2,.4)) : paperA(rr(R,.4,.7));
        ctx.fillRect(rs[i][0]+rr(R,-w*.8-.6,w*.8+.6)-sz/2, rs[i][1]+rr(R,-w*.8-.6,w*.8+.6)-sz/2, sz, sz);
      }
    }
  }
  function hatch(R, cx, cy, wdt, hgt, ang, n, alpha, w=1.1){
    const px=Math.cos(ang+Math.PI/2), py=Math.sin(ang+Math.PI/2);
    const dx=Math.cos(ang), dy=Math.sin(ang);
    for(let i=0;i<n;i++){
      const t=(i/(n-1||1)-.5)*wdt;
      const jl=rr(R,.75,1.2), jo=rr(R,-.1,.1)*hgt;
      sline(R,[[cx+px*t-dx*(hgt/2*jl)+jo*dx, cy+py*t-dy*(hgt/2*jl)+jo*dy],
               [cx+px*t+dx*(hgt/2*jl)+jo*dx, cy+py*t+dy*(hgt/2*jl)+jo*dy]], w, alpha*rr(R,.6,1.15));
    }
  }
  function hatchFill(R, pts, spacing, ang, alpha, w=1.1){
    const [x0,y0,x1,y1]=bbox(pts);
    const diag=Math.hypot(x1-x0,y1-y0);
    const cx=(x0+x1)/2, cy=(y0+y1)/2;
    ctx.save();
    poly(pts,true); ctx.clip();
    const px=Math.cos(ang+Math.PI/2), py=Math.sin(ang+Math.PI/2);
    const dx=Math.cos(ang), dy=Math.sin(ang);
    const n=Math.ceil(diag/spacing);
    for(let i=-n;i<=n;i++){
      const t=i*spacing+rr(R,-.2,.2)*spacing;
      sline(R,[[cx+px*t-dx*diag*.6, cy+py*t-dy*diag*.6],[cx+px*t+dx*diag*.6, cy+py*t+dy*diag*.6]], w, alpha*rr(R,.6,1.1));
    }
    ctx.restore();
  }
  function stippleFill(R, pts, spacing, alpha){
    const [x0,y0,x1,y1]=bbox(pts);
    const n=((x1-x0)*(y1-y0))/(spacing*spacing);
    ctx.save();
    poly(pts,true); ctx.clip();
    for(let i=0;i<n;i++){
      const sz=rr(R,.8,1.8);
      ctx.fillStyle=inkA(alpha*rr(R,.5,1.2));
      ctx.fillRect(rr(R,x0,x1), rr(R,y0,y1), sz, sz);
    }
    ctx.restore();
  }
  function scribbleFill(R, pts, spacing, alpha){
    const [x0,y0,x1,y1]=bbox(pts);
    ctx.save();
    poly(pts,true); ctx.clip();
    const slope=rr(R,-.25,.25);
    for(let y=y0-spacing;y<y1+spacing;y+=spacing*rr(R,.8,1.2)){
      const line=[];
      const ph=rr(R,0,7);
      for(let x=x0;x<=x1;x+=5)
        line.push([x, y+(x-x0)*slope + Math.sin(x*.55+ph)*spacing*.42 + rr(R,-1,1)]);
      if(line.length>1) sline(R,line,1,alpha*rr(R,.6,1.05));
    }
    ctx.restore();
  }
  function blobPts(R,cx,cy,rx,ry){
    const rot=rr(R,0,TAU), ph=rr(R,0,7), n=16, pts=[];
    for(let i=0;i<n;i++){
      const t=i/n*TAU;
      const m=1+.17*Math.sin(t*2+ph)+.1*Math.sin(t*5+ph*2.3);
      const x=Math.cos(t)*rx*m, y=Math.sin(t)*ry*m;
      pts.push([cx + x*Math.cos(rot)-y*Math.sin(rot), cy + x*Math.sin(rot)+y*Math.cos(rot)]);
    }
    return chaikin(pts,true,1);
  }
  function pencilFill(R, pts, darkness){
    const [x0,y0,x1,y1]=bbox(pts);
    ctx.save();
    poly(pts,true); ctx.clip();
    ctx.fillStyle=inkA(darkness*.48);
    ctx.fillRect(x0,y0,x1-x0,y1-y0);
    for(let pass=0;pass<2;pass++){
      const slope=rr(R,-.5,.5), sp=rr(R,2.6,3.8);
      for(let y=y0-sp;y<y1+sp;y+=sp*rr(R,.8,1.25)){
        const line=[];
        const ph=rr(R,0,7);
        for(let x=x0;x<=x1;x+=5)
          line.push([x, y+(x-x0)*slope + Math.sin(x*.5+ph)*sp*.4 + rr(R,-1,1)]);
        if(line.length>1) sline(R,line,rr(R,1.4,2.2),darkness*rr(R,.42,.62));
      }
    }
    for(let k=0;k<ri(R,2,3);k++){
      poly(blobPts(R, rr(R,x0,x1), rr(R,y0,y1), (x1-x0)*rr(R,.1,.22), (y1-y0)*rr(R,.1,.2)),true);
      ctx.fillStyle=paperA(rr(R,.06,.14));
      ctx.fill();
    }
    ctx.restore();
  }
  function inkFill(pts, a){ poly(pts,true); ctx.fillStyle=inkA(a); ctx.fill(); }
  function paperFill(pts){ poly(pts,true); ctx.fillStyle=PAPER; ctx.fill(); }
  function wobblyEllipse(R,cx,cy,rx,ry){
    const ph=rr(R,0,7), n=18;
    ctx.beginPath();
    for(let i=0;i<=n;i++){
      const t=i/n*TAU;
      const m=1+.05*Math.sin(t*3+ph)+.03*Math.sin(t*7+ph*2);
      const x=cx+Math.cos(t)*rx*m+rr(R,-.3,.3), y=cy+Math.sin(t)*ry*m+rr(R,-.3,.3);
      i?ctx.lineTo(x,y):ctx.moveTo(x,y);
    }
    ctx.closePath();
  }
  function curl(R,cx,cy,r,a0,len,color,width){
    ctx.beginPath();
    const n=7;
    for(let i=0;i<=n;i++){
      const a=a0+len*i/n;
      const x=cx+Math.cos(a)*r*rr(R,.92,1.08)+rr(R,-.4,.4);
      const y=cy+Math.sin(a)*r*rr(R,.92,1.08)+rr(R,-.4,.4);
      i?ctx.lineTo(x,y):ctx.moveTo(x,y);
    }
    ctx.strokeStyle=color;
    ctx.lineWidth=width; ctx.lineCap='round'; ctx.lineJoin='round';
    ctx.stroke();
  }
  function bgDeco(R, colr, cx, cy, rx, ry, style){
    CUR_INK = colr;
    if(style==='patch' || style==='corner'){
      const px = style==='corner' ? cx+(chance(R,.5)?-1:1)*rx*.5 : cx;
      const py = style==='corner' ? cy-ry*rr(R,.3,.55) : cy;
      const prx = style==='corner' ? rx*.62 : rx, pry = style==='corner' ? ry*.6 : ry;
      const hb=blobPts(R,px,py,prx,pry);
      poly(hb,true); ctx.fillStyle=inkA(.12); ctx.fill();
      scribbleFill(R, hb, Math.max(3,prx*rr(R,.05,.07)), .4);
      if(chance(R,.4)) hatchFill(R, hb, prx*.09, rr(R,.6,1.4), .18, 1.2);
      for(let i=0;i<26;i++){
        const t=rr(R,0,TAU), m=rr(R,.97,1.09), sz=rr(R,1,2.2);
        ctx.fillStyle=inkA(rr(R,.15,.4));
        ctx.fillRect(px+Math.cos(t)*prx*m-sz/2, py+Math.sin(t)*pry*m-sz/2, sz, sz);
      }
    } else if(style==='ring'){
      const n=ri(R,1,3);
      for(let k=0;k<n;k++)
        sline(R, circlePts(cx+rr(R,-.03,.03)*rx, cy+rr(R,-.03,.03)*ry,
                           rx*rr(R,.92,1.04), ry*rr(R,.92,1.04), 30, rr(R,0,.5)),
              rr(R,2,3.6), .55);
    } else if(style==='splash'){
      const m=ri(R,10,16);
      for(let i=0;i<m;i++){
        const a=rr(R,0,TAU);
        const r0=rr(R,.72,.92), r1=r0+rr(R,.15,.4);
        stroke(R,[[cx+Math.cos(a)*rx*r0, cy+Math.sin(a)*ry*r0],
                  [cx+Math.cos(a)*rx*r1, cy+Math.sin(a)*ry*r1]],
               rr(R,2,4), {wedge:chance(R,.5), taper:.3, alpha:rr(R,.4,.7)});
      }
      for(let i=0;i<10;i++){
        const a=rr(R,0,TAU), rad=rr(R,1.0,1.3), sz=rr(R,1.5,3);
        ctx.fillStyle=inkA(rr(R,.3,.6));
        ctx.fillRect(cx+Math.cos(a)*rx*rad-sz/2, cy+Math.sin(a)*ry*rad-sz/2, sz, sz);
      }
    } else if(style==='dots'){
      for(let i=0,n=ri(R,38,55);i<n;i++){
        const a=rr(R,0,TAU), rad=Math.sqrt(rr(R,0,1));
        const sz=rr(R,1.2,2.8);
        ctx.fillStyle=inkA(rr(R,.25,.55));
        ctx.fillRect(cx+Math.cos(a)*rx*1.12*rad-sz/2, cy+Math.sin(a)*ry*1.12*rad-sz/2, sz, sz);
      }
    } else {
      const under=chance(R,.55);
      const sb = under
        ? blobPts(R, cx, cy+ry*.95, rx*rr(R,.8,1.0), ry*rr(R,.16,.24))
        : blobPts(R, cx+(chance(R,.5)?-1:1)*rx*.82, cy+ry*rr(R,-.1,.2), rx*rr(R,.2,.3), ry*rr(R,.65,.85));
      scribbleFill(R, sb, Math.max(2.5,rx*.045), .5);
    }
    CUR_INK = INK;
  }

  /* ============================ 5. casting ============================
     Pure. No drawing, no canvas. Give it a seeded R and it hands back a
     person. Everything downstream just paints what this decided.
     ==================================================================== */

  /* A drawing can only ever depict presentation, not identity, so that is what
     this parameter controls: which way the portrait leans. 'any' lets the seed
     decide, which is what you want when nobody has said. 'fluid' deliberately
     draws from both pools rather than picking one. */
  const HAIR_FEMME = [['bob',15],['long',18],['spiky',1],['buzz',0],['slick',1],['undercut',2],
    ['mullet',0],['ponytail',13],['hime',7],['messy',7],['curly',10],['buns',8],['braids',8],
    ['mohawk',0],['wavy',13],['bowl',2],['dreads',4]];
  const HAIR_MASC  = [['bob',3],['long',4],['spiky',13],['buzz',13],['slick',10],['undercut',13],
    ['mullet',5],['ponytail',4],['hime',0],['messy',13],['curly',8],['buns',0],['braids',1],
    ['mohawk',5],['wavy',3],['bowl',7],['dreads',6]];
  const HAIR_FLUID = HAIR_FEMME.map((p,i)=>[p[0], p[1]+HAIR_MASC[i][1]]);

  function castTraits(R, present='any'){
    const T = {};

    // ---- presentation ----
    const lean = (present==='any' || !present)
      ? weighted(R,[['femme',44],['masc',44],['fluid',12]])
      : present;
    const F = lean==='femme', M = lean==='masc';
    T.present = lean;
    const bias = (f,m,x) => F ? f : M ? m : x;

    // ---- pose ----
    const facing = weighted(R,[['straight',30],['mild',36],['strong',34]]);
    T.turn = (facing==='straight' ? rr(R,-.1,.1)
            : facing==='mild' ? rr(R,.28,.5)*(chance(R,.5)?1:-1)
            : rr(R,.58,.9)*(chance(R,.5)?1:-1));
    T.at = Math.abs(T.turn);
    T.ts = Math.sign(T.turn)||1;

    // ---- skull ----
    // Wider than the reference on every axis. The first crowd came out uniformly
    // long and gaunt because cheek width was a fixed constant and the chin range
    // was narrow, so every face inherited the same oval.
    T.wRatio = rr(R,.54,.86);
    T.jaw    = bias(rr(R,.66,.98), rr(R,.86,1.12), rr(R,.72,1.06));
    // chinW below ~.5 collapses the chin to a point and the whole head reads as
    // a lozenge, not a face. .35 was too greedy.
    T.chinW  = rr(R,.55,1.20);
    T.skullY = rr(R,.78,.96);
    T.chinY  = rr(R,.66,.90);
    T.cheek  = rr(R,.88,1.10);      // round face against narrow face
    T.brow   = rr(R,.90,1.12);      // temple width, free of the cheek
    T.sizeJitter = rr(R,.78,1.02);

    // ---- hair ----
    T.hairStyle = weighted(R, bias(HAIR_FEMME, HAIR_MASC, HAIR_FLUID));
    T.bangType = ({bob:'clumps', long:'clumps', messy:'ragged', hime:'straight', undercut:'sweep',
                   mullet:'clumps', braids:'clumps', wavy:'clumps',
                   ponytail: chance(R,.5)?'clumps':null})[T.hairStyle] ?? null;
    // 'light' is the weakest renderer we have: the front hair piece paper-fills
    // over the back mass, and a pale tone puts too little back, so the crown can
    // come out blank. Held at 8% until it gets a proper strand-based pass.
    // Solid black is what makes the reference read from a distance. We had none.
    T.hairTone = weighted(R,[['black',38],['hatch',25],['scribble',19],['stipple',12],['light',6]]);
    // A cap style has no silhouette outside the skull to carry a pale tone, so
    // 'light' on one of these reads as a bald head, not as fair hair.
    if(T.hairTone==='light' && ['buzz','slick','bowl','mohawk','buns','undercut','spiky'].includes(T.hairStyle))
      T.hairTone = weighted(R,[['black',45],['hatch',35],['stipple',20]]);

    // ---- features ----
    T.shadeStyle = weighted(R,[[null,20],['hatch',17],['scrib',24],['cross',10],['stipple',14],['smudge',15]]);
    T.eyeType    = weighted(R,[['sharp',42],['big',32],['narrow',17],['closed',9]]);
    T.eyeScale   = rr(R,.8,1.15);
    T.browWeight = bias(rr(R,.72,1.0), rr(R,1.06,1.4), rr(R,.86,1.18));
    T.lashScale  = bias(rr(R,1.1,1.32), rr(R,.82,1.0), rr(R,.95,1.15));
    T.mouthStyle = weighted(R,[['flat',24],['frown',14],['smirk',24],['open',12],['soft',26]]);
    T.faceMark   = weighted(R,[[null,72],['mole',13],['scar',15]]);

    // ---- dev-subtle, in place of the reference's hardware ----
    // glasses carry most of it; everything else is an accent that shows up rarely
    // Glasses were on 46% of everyone, which made the commonest accessory the
    // quietest one. Rare and loud beats common and quiet.
    T.glasses    = weighted(R,[[null,58],['round',11],['square',10],['thin',6],
                               ['shades',9],['aviator',6]]);
    T.headphones = !['mohawk','buns'].includes(T.hairStyle) && chance(R,.24);
    T.earbuds    = !T.headphones && chance(R,.09);
    // Headwear reads from across the room in a way wire frames never will.
    T.headwear   = !['mohawk','buns'].includes(T.hairStyle)
                   ? weighted(R,[[null,46],['cap',14],['capback',7],['beanie',9],
                                 ['cowboy',6],['bucket',7],['band',5],['visor',6]])
                   : null;
    // Rare on purpose: a mask is the loudest thing the generator can draw, and it
    // stops being a treat the moment it is common.
    T.hero       = chance(R,.09) ? weighted(R,[['web',34],['bat',33],['claw',33]]) : null;
    // rolled unconditionally so it is always available if a mask is pinned later
    T.heroC      = chance(R,.80) ? pick(R,HEROC) : null;             // else graphite
    T.hatDark    = chance(R,.5);
    T.hatTex     = weighted(R,[['plain',36],['hatch',32],['stipple',32]]);
    T.hatC       = chance(R,.26) ? pick(R,ACCENTC) : null;
    T.neckStub   = chance(R,.45);      // two short strokes, no shoulders
    T.screenGlow = chance(R,.16);
    T.stubble    = chance(R, bias(.02,.44,.17));
    T.freckles   = chance(R,.18);
    T.studs      = chance(R, bias(.34,.07,.22));
    T.bandage    = chance(R,.06);
    // a mask covers all of this, so nothing else competes with it
    if(T.hero){
      T.glasses=null; T.headwear=null; T.headphones=false; T.earbuds=false;
      T.stubble=false; T.freckles=false; T.studs=false; T.bandage=false;
    }

    // ---- rendering ----
    T.shadowSide = -T.ts;
    T.markSide   = chance(R,.5)?-1:1;
    T.modSide    = T.at>.3 ? T.ts : (chance(R,.5)?-1:1);
    T.press      = rr(R,.85,1.45);

    // ---- colour ----
    T.plain    = chance(R,.12);
    T.haloC    = !T.plain && chance(R,.70) ? pick(R,HALOC) : null;
    T.skinC    = !T.plain && chance(R,.62) ? pick(R,SKINC) : null;
    T.skinScrib= chance(R,.4);
    T.blushOn  = !T.plain && chance(R, bias(.55,.28,.42));
    T.hairColC = !T.plain && chance(R,.22) ? pick(R,HAIRCOL) : null;
    T.accentC  = !T.plain && chance(R,.35) ? pick(R,ACCENTC) : null;
    T.decoStyle= weighted(R,[['patch',30],['ring',17],['splash',15],['dots',12],['swoosh',13],['corner',13]]);
    T.darkSkin = chance(R,.2);
    T.scaffold = chance(R,.30);

    return T;
  }

  /* ============================ 6. the portrait ============================ */

  function drawPortrait(R, T, c, opts={}){
    ctx.save();
    ctx.beginPath(); ctx.rect(c.x,c.y,c.w,c.h); ctx.clip();

    // Heads only. A bust gave every portrait the same silhouette, which is what
    // made a grid of them read as one repeated block.
    const s = Math.min(c.w*.45, c.h*.37) * T.sizeJitter * (opts.scale ?? 1);
    DETAIL = Math.max(.7, Math.min(2.2, s/72));

    ctx.translate(c.x + c.w/2 + rr(R,-.015,.015)*c.w,
                  c.y + c.h*.5 + rr(R,-.012,.012)*c.h);
    ctx.rotate(rr(R,-.07,.07));

    const {turn, at, ts} = T;
    const w = s*T.wRatio;
    const press = T.press;
    // A drawing made bigger is not the same drawing scaled up. On a larger sheet
    // the hand keeps roughly the same physical line, so lines read finer and
    // texture reads tighter relative to the subject. K is that correction:
    // below 1 for big portraits, above 1 for thumbnails.
    const K = Math.min(1.3, Math.max(.55, Math.pow(72/s, .32)));
    const TW = Math.max(1, 1.15/K*.82);          // texture line width
    const lwMain = s*.05*press*Math.max(.74,K), lwThin = s*.021*press*K;
    const aj = () => rr(R,-.028,.028)*s;

    // the turn is real: the near side of the skull swells, the far side
    // collapses, chin and crown push toward where the face points
    const kp = side => {
      const sc = 1 + (side===ts ? .1 : -.28)*at;
      return [
        [side*w*.80*T.brow*sc+aj(), -s*T.skullY*.72+aj()],
        [side*w*.97*T.cheek*sc+aj(), -s*.20+aj()],
        [side*w*.94*T.cheek*sc+aj(),  s*.15+aj()],
        [side*w*.80*T.jaw*sc+aj(), s*T.chinY*.6+aj()],
        // the jaw turns the corner in two steps, or it comes to a point
        [side*w*.62*T.jaw*sc+aj(), s*T.chinY*.79+aj()],
        [side*w*.34*T.chinW*sc+aj(), s*T.chinY*.93+aj()],
      ];
    };
    const right = kp(1), left = kp(-1);
    const chin = [turn*w*.3, s*T.chinY+aj()*.5];
    const skullTop = [turn*w*.16, -s*T.skullY];
    const facePoly = chaikin([skullTop, ...right, chin, ...left.slice().reverse()], true, 2);
    const outlineOpen = chaikin([right[0], ...right.slice(1), chin, ...left.slice(1).reverse(), left[0]], false, 1);
    // The hairline sat at -.66s while the crown sits at -.85s, so capPts traced a
    // crescent barely .1s thick — which is why every cap style rendered bald.
    const hairlinePts = [[-.82*w,-.40*s],[-.45*w,-.54*s],[turn*w*.12,(-.56+(chance(R,.4)?.05:0))*s],[.45*w,-.54*s],[.82*w,-.40*s]];

    const toneFill = pts => {
      paperFill(pts);
      if(T.hairTone==='black') pencilFill(R,pts,1);
      else if(T.hairTone==='hatch'){ inkFill(pts,.06); hatchFill(R, pts, s*.045*K, rr(R,1.1,1.7), .4, TW); }
      else if(T.hairTone==='scribble'){ inkFill(pts,.05); scribbleFill(R, pts, s*.05*K, .42); }
      else if(T.hairTone==='stipple'){ inkFill(pts,.04); stippleFill(R, pts, s*.028*K, .5); }
      // 'light' still has to read as hair — at 3% ink a cap style looked bald,
      // but tight near-vertical hatching over a long style reads as a curtain
      else { inkFill(pts,.09); hatchFill(R, pts, s*.052*K, rr(R,1.2,1.75), .30, TW); }
    };
    const hairPiece = (pts, o={}) => {
      toneFill(pts);
      // a pale mass needs a firmer silhouette or the shape never resolves
      const lw = (o.lw ?? lwThin*1.3) * (T.hairTone==='light' ? 1.35 : 1);
      broken(R, pts.concat([pts[0]]), lw, {ghost:true, amp:o.amp});
    };
    const capPts = () => chaikin([...hairlinePts,[.80*w,-s*T.skullY*.72],[turn*w*.12,-s*T.skullY*1.0],[-.80*w,-s*T.skullY*.72]],true,2);

    const eh = ({big:s*.125, sharp:s*.09, narrow:s*.055, closed:s*.07})[T.eyeType]*rr(R,.9,1.1)*T.eyeScale;
    const fx = turn*w*.3;
    const sx = w*.52;
    const ew0 = w*.32*T.eyeScale;
    const eyeX = sd => fx + sd*sx*(sd===ts ? 1+.04*at : 1-.38*at);
    const eyeW = sd => ew0*(sd===ts ? 1-.05*at : 1-.55*at);

    /* ---- background colour behind the head ---- */
    function layerHalo(){
      if(!T.haloC) return;
      const hrx=Math.min(s*rr(R,.95,1.1), c.w*.44), hry=Math.min(s*rr(R,1.0,1.18), c.h*.43);
      const colr=(T.decoStyle==='ring'||T.decoStyle==='splash') && chance(R,.3) ? pick(R,ACCENTC) : T.haloC;
      bgDeco(R, colr, rr(R,-.06,.06)*s, -s*.12+rr(R,-.05,.05)*s, hrx, hry, T.decoStyle);
    }

    /* ---- the construction circle, still showing ---- */
    function layerScaffold(){
      if(!T.scaffold) return;
      sline(R, circlePts(0,-s*.1, w*1.04, s*.9, 26), 1, .09);
      sline(R, [[turn*w*.2,-s*1.02],[turn*w*.14,s*.95]], 1, .07);
      sline(R, [[-w*1.1,0],[w*1.1,0]], 1, .07);
    }

    /* ---- hair behind the head ---- */
    function layerHairBack(){
      if(T.hairColC) CUR_INK = T.hairColC;
      const hs = T.hairStyle;
      if(hs==='bob' || hs==='messy'){
        const rag = hs==='messy';
        let pts=[[-1.18*w,s*.55],[-1.24*w,-.45*s],[-.9*w,-1.02*s],[0,-1.15*s],[.9*w,-1.02*s],[1.24*w,-.45*s],[1.18*w,s*.55]];
        if(rag){
          const bot=[];
          for(let i=0;i<6;i++){
            const x=1.05*w - i*(2.1*w/5);
            bot.push([x+rr(R,-.06,.06)*w, s*(.55+rr(R,0,.25))],[x-w*.17, s*(.42+rr(R,0,.1))]);
          }
          pts=[...pts,...bot];
        } else pts.push([0,s*.62]);
        hairPiece(chaikin(pts,true,rag?1:2), {lw:lwMain});
      } else if(hs==='long' || hs==='hime'){
        // Stops around the jaw. With no shoulders under it, hair falling past the
        // chin rests on nothing and reads as a dark bib.
        const flare=rr(R,.88,1.12), fall=s*rr(R,.76,.92);
        const bot=[];
        if(chance(R,.5)){
          bot.push([1.02*w*flare,fall],[-1.02*w*flare,fall]);
        } else {
          const nt=ri(R,3,5);
          for(let i=0;i<=nt;i++){
            const x=(1.02 - i*2.04/nt)*w*flare;
            bot.push([x, fall+((i%2)?-s*.12:s*rr(R,0,.08))]);
          }
        }
        hairPiece(chaikin([[-1.02*w,-.5*s],[-.95*w,-1.04*s],[0,-1.16*s],[.95*w,-1.04*s],[1.02*w,-.5*s],
                           [1.04*w*flare,s*.35],...bot.reverse(),[-1.04*w*flare,s*.35]],true,2), {lw:lwMain});
        // strands down the fall, so it has body instead of reading as a flat wig
        for(const sd of[-1,1])
          for(let k=0;k<3;k++)
            sline(R,[[sd*w*(.94+.05*k),-.2*s],[sd*w*flare*(1.0+.05*k),s*.45],
                     [sd*w*flare*(.92+.05*k),fall*.92]],1.2,
                  T.hairTone==='black'?0:.3, T.hairTone==='black'?paperA(.42):undefined);
      } else if(hs==='wavy'){
        const fall=s*rr(R,.8,.95);
        const side=[];
        for(let k=0;k<=5;k++){
          const y=-.4*s + (fall+.4*s)*k/5;
          side.push([w*(1.04+.09*Math.sin(k*2.1+1)), y]);
        }
        const sideL = side.map(p=>[-p[0],p[1]]).reverse();
        hairPiece(chaikin([[-1.02*w,-.5*s],[-.92*w,-1.03*s],[0,-1.15*s],[.92*w,-1.03*s],[1.02*w,-.5*s],
                           ...side,[w*.7,fall+s*.06],[0,fall+s*.02],[-w*.7,fall+s*.06],...sideL],true,1), {lw:lwMain, amp:1.6});
        for(const sd of[-1,1])
          for(let k2=0;k2<2;k2++){
            const x0=sd*w*(.85+.12*k2);
            const pts2=[];
            for(let k=0;k<=6;k++) pts2.push([x0+sd*w*.08*Math.sin(k*1.8+k2), -s*.2+(fall+s*.1)*k/6]);
            sline(R,pts2,1.2,T.hairTone==='black'?0:.3, T.hairTone==='black'?paperA(.4):undefined);
          }
      } else if(hs==='spiky'){
        const pts=[];
        const nsp=ri(R,9,13);
        for(let i=0;i<=nsp;i++){
          const a=Math.PI+ i/nsp*Math.PI;
          pts.push([Math.cos(a)*w*1.0, -s*.05+Math.sin(a)*s*.9]);
          if(i<nsp){
            const a2=Math.PI+(i+.5)/nsp*Math.PI;
            const len=rr(R,.12,.26)*s;
            pts.push([Math.cos(a2)*(w*1.0+len), -s*.05+Math.sin(a2)*(s*.9+len)]);
          }
        }
        pts.push([w*1.0,s*.1],[-w*1.0,s*.1]);
        hairPiece(pts, {amp:.8});
      } else if(hs==='ponytail'){
        // the tail was anchored above the crown, so it read as a detached blob;
        // it now springs from the side of the head and hugs it
        const d=-ts;
        hairPiece(chaikin([[d*.58*w,-.68*s],[d*1.22*w,-.44*s],[d*1.34*w,s*.24],[d*1.04*w,s*.94],
                           [d*.86*w,s*.38],[d*.80*w,-.22*s]],true,2));
        sline(R,[[d*1.08*w,-.24*s],[d*1.10*w,s*.62]],1.2,T.hairTone==='black'?0:.3,
              T.hairTone==='black'?paperA(.4):undefined);
        // the band where it is gathered
        sline(R, circlePts(d*.72*w, -.42*s, w*.10, s*.075, 10), lwThin*1.3, .55);
      } else if(hs==='mullet'){
        // was two thin slivers; a mullet needs actual weight at the back
        for(const sd of[-1,1])
          hairPiece(chaikin([[sd*.92*w,s*.10],[sd*1.12*w,s*.52],[sd*1.02*w,s*1.02],
                             [sd*.52*w,s*1.06],[sd*.40*w,s*.58],[sd*.62*w,s*.16]],true,2));
      } else if(hs==='buns'){
        // buns were too small to register at thumbnail size
        if(chance(R,.5)){
          const bx=turn*w*.15+rr(R,-.1,.1)*w;
          hairPiece(blobPts(R,bx,-s*(T.skullY+.16),s*.26,s*.21));
          sline(R,[[bx-s*.12,-s*(T.skullY+.02)],[bx+s*.11,-s*(T.skullY+.04)]],1.4,.55);
        } else {
          for(const sd of[-1,1]) hairPiece(blobPts(R,sd*w*.74,-s*(T.skullY-.02),s*.20,s*.18));
        }
      } else if(hs==='braids'){
        for(const sd of[-1,1]){
          let bx=sd*w*.8, by=s*.12;
          for(let i=0;i<5;i++){
            hairPiece(circlePts(bx, by, w*.09, s*.075, 10, sd*.3));
            bx += sd*w*rr(R,-.05,.02); by += s*.135;
          }
          for(let k=0;k<3;k++) sline(R,[[bx,by-s*.06],[bx+sd*w*rr(R,-.06,.06), by+s*.05]],1.2,.5);
        }
      } else if(hs==='dreads'){
        const nd=ri(R,6,8);
        for(let i=0;i<nd;i++){
          const a=Math.PI*(.15+.7*i/(nd-1));
          const bx=-Math.cos(a)*w*.95, by=-s*.35-Math.sin(a)*s*.5;
          const tip=[bx+rr(R,-.15,.15)*w, s*rr(R,.3,.85)];
          const path=chaikin([[bx,by],[bx+rr(R,-.1,.1)*w,(by+tip[1])/2],tip],false,1);
          const Le=offsetPath(path,w*.045), Re=offsetPath(path,-w*.045);
          toneFill([...Le,...Re.slice().reverse()]);
          sline(R,Le,1.1,.55); sline(R,Re,1.1,.5);
          sline(R,[[tip[0]-w*.04,tip[1]-s*.08],[tip[0]+w*.04,tip[1]-s*.1]],1,.4);
        }
      }
      CUR_INK = INK;
    }

    /* ---- the neck ----
       Two short strokes and a little shadow. No shoulders, no clothing: the bust
       gave every portrait an identical silhouette, which is exactly what made a
       grid of them read as one repeated block. ---- */
    function layerNeck(){
      if(!T.neckStub) return;
      const drift = turn*w*.10;
      const top = s*(T.chinY*.74), bot = s*(T.chinY+.30);
      stroke(R,[[-w*.42+drift*1.3, top],[-w*.38+drift*.6, bot]], lwThin*1.15, {taper:.4, alpha:.6});
      stroke(R,[[ w*.42+drift*1.3, top],[ w*.38+drift*.6, bot]], lwThin*1.15, {taper:.4, alpha:.6});
      if(chance(R,.55)) hatch(R, drift, s*(T.chinY+.12), w*.52, s*.14, .1+turn*.3, ri(R,3,5), .12);
    }

    /* ---- the face ---- */
    function layerFace(){
      paperFill(facePoly);
      if(T.skinC){
        // coloured in by hand — strokes visible, never quite on the drawing
        const dx=rr(R,-.035,.035)*s, dy=rr(R,-.03,.03)*s, sc=rr(R,.95,1.03);
        const skinPoly=facePoly.map(q=>[q[0]*sc+dx, q[1]*sc+dy]);
        CUR_INK = T.skinC;
        poly(skinPoly,true); ctx.fillStyle=inkA(.08); ctx.fill();
        if(T.skinScrib) scribbleFill(R, skinPoly, s*rr(R,.032,.045)*K, .45);
        else {
          hatchFill(R, skinPoly, s*rr(R,.035,.05)*K, rr(R,.7,1.5), .4, TW*1.2);
          if(chance(R,.5)) hatchFill(R, skinPoly, s*.07*K, rr(R,-1.4,-.7), .18, TW);
        }
        CUR_INK = INK;
      }
      broken(R, outlineOpen, lwMain, {ghost:true, over:s*.035, taper:.12});
      if(T.darkSkin && !T.skinC) hatchFill(R, facePoly, s*.08, -1.05, .08, 1);
    }

    function layerEars(){
      const visible = ['buzz','slick','spiky','mullet','ponytail','undercut','buns','mohawk','bowl','braids'].includes(T.hairStyle);
      const sides = at>.3 ? [-ts] : [-1,1];
      if(!visible) return sides;
      for(const sd of sides){
        const ep=chaikin([[sd*w*.95,-.02*s],[sd*w*1.12,.02*s],[sd*w*1.1,.16*s],[sd*w*.93,.2*s]],false,1);
        paperFill([...ep,[sd*w*.93,.02*s]]);
        if(T.skinC){ poly([...ep,[sd*w*.93,.02*s]],true); ctx.fillStyle=colA(T.skinC,.45); ctx.fill(); }
        sline(R, ep, lwThin*1.1, .8);
        sline(R,[[sd*w*1.0,.06*s],[sd*w*1.04,.12*s]],1,.35);
        if(T.studs && chance(R,.5))
          for(let k=0;k<ri(R,1,2);k++)
            sline(R,circlePts(sd*w*1.05,s*(.19+.05*k),s*.014,s*.016,8),1.1,.6);
      }
      return sides;
    }

    function layerShading(){
      const ss = T.shadeStyle, side = T.shadowSide;
      if(ss==='hatch'){
        hatch(R, side*w*.6, s*.32, s*.3, s*.2, -1.05*side, ri(R,4,7), .19);
      } else if(ss==='scrib'){
        ctx.save(); poly(facePoly,true); ctx.clip();
        scribbleFill(R, blobPts(R, side*w*rr(R,.35,.6), s*rr(R,.12,.42), w*rr(R,.2,.32), s*rr(R,.12,.2)), s*rr(R,.026,.04), .42);
        if(chance(R,.5))
          scribbleFill(R, blobPts(R, side*w*rr(R,.4,.7), -s*rr(R,.05,.25), w*rr(R,.1,.2), s*rr(R,.06,.12)), s*.03, .3);
        ctx.restore();
      } else if(ss==='cross'){
        hatch(R, side*w*.6, s*.32, s*.26, s*.18, -1.05*side, ri(R,4,6), .17);
        hatch(R, side*w*.6, s*.32, s*.26, s*.18, -1.05*side+1.2, ri(R,3,5), .14);
      } else if(ss==='stipple'){
        ctx.save(); poly(facePoly,true); ctx.clip();
        for(let i=0;i<46*DETAIL;i++){
          ctx.fillStyle=inkA(rr(R,.18,.45));
          ctx.fillRect(side*w*rr(R,.35,.85), s*rr(R,.0,.6), rr(R,.8,1.6), rr(R,.8,1.6));
        }
        ctx.restore();
      } else if(ss==='smudge'){
        ctx.save(); poly(facePoly,true); ctx.clip();
        for(let k=0;k<3;k++){
          poly(blobPts(R, side*w*rr(R,.4,.65), s*rr(R,.1,.45), w*rr(R,.2,.38), s*rr(R,.12,.3)),true);
          ctx.fillStyle=inkA(.07); ctx.fill();
        }
        ctx.restore();
      }
      if(T.bangType){
        if(chance(R,.5)) hatch(R, turn*w*.15, -s*.32, w*1.0, s*.08, .06, 3, .08);
        else {
          ctx.save(); poly(facePoly,true); ctx.clip();
          scribbleFill(R, blobPts(R, turn*w*.15, -s*.34, w*.55, s*.06), s*.03, .16);
          ctx.restore();
        }
      }
    }

    /* ---- the monitor is the only light source in the room ---- */
    function layerScreenGlow(){
      if(!T.screenGlow) return;
      ctx.save(); poly(facePoly,true); ctx.clip();
      // lift the lower face back toward paper
      for(let k=0;k<3;k++){
        poly(blobPts(R, fx+rr(R,-.15,.15)*w, s*rr(R,.34,.58), w*rr(R,.45,.7), s*rr(R,.16,.26)),true);
        ctx.fillStyle=paperA(rr(R,.3,.5)); ctx.fill();
      }
      // and press the brow down, so the lift reads as light rather than erasure
      hatch(R, fx, -s*.5, w*1.5, s*.24, .05, ri(R,4,6), .13);
      ctx.restore();
      // a cold rim under the jaw
      const cg = T.accentC || [120,132,150];
      CUR_INK = cg;
      sline(R, chaikin([[-w*.5+fx, s*(T.chinY*.86)],[fx, s*(T.chinY+.04)],[w*.5+fx, s*(T.chinY*.86)]],false,2), lwThin*1.2, .3);
      CUR_INK = INK;
    }

    function layerBlush(){
      if(!T.blushOn) return;
      ctx.save(); poly(facePoly,true); ctx.clip();
      CUR_INK = BLUSHC;
      for(const sd of[-1,1])
        scribbleFill(R, blobPts(R, turn*w*.25+sd*w*rr(R,.42,.58), s*rr(R,.3,.4), w*rr(R,.13,.19), s*rr(R,.06,.09)), s*rr(R,.02,.028), .42);
      CUR_INK = INK;
      ctx.restore();
    }

    /* ---- the eyes ---- */
    function layerEyes(){
      const fierce = rr(R,-.05,.55);
      const gaze = ew0*(turn*.35 + rr(R,-.1,.1));
      const browY = -eh*1.2 - s*rr(R,.1,.17);
      const browA = rr(R,-.08,.4);
      const browTh = s*rr(R,.018,.042)*T.browWeight;
      const lashW = ({big:s*.055, sharp:s*.048, narrow:s*.04, closed:s*.045})[T.eyeType]*press*T.lashScale;

      for(const sd of [-1,1]){
        const ecx = eyeX(sd) + aj()*.4;
        const ew = eyeW(sd);
        ctx.save();
        ctx.translate(0, rr(R,-.022,.022)*s);
        stroke(R,[[ecx-sd*ew*.95, browY+browA*eh*1.6],[ecx+sd*ew*.85, browY-browA*eh*1.6]], browTh, {over:s*.02, taper:.32});

        if(T.eyeType==='closed'){
          stroke(R, chaikin([[ecx-sd*ew*.95, eh*.2],[ecx, eh*.85],[ecx+sd*ew*.95, eh*.1]],false,1), lashW*.8, {taper:.25});
          stroke(R,[[ecx+sd*ew*.9, eh*.15],[ecx+sd*ew*1.2, eh*.45]], lashW*.6, {wedge:true});
          ctx.restore();
          continue;
        }

        const lash = chaikin([[ecx-sd*ew*.95, eh*.12],[ecx+sd*ew*.05, -eh*.62],
                              [ecx+sd*ew*1.0, -eh*(.25+fierce*.55)]], false, 1);
        const cix = ecx + gaze*(sd===ts?1:.8), ciy = eh*.3;
        const irx = ew*.5, iry = eh*1.15;
        ctx.save();
        poly([...lash, [ecx+sd*ew*1.05, eh*3], [ecx-sd*ew*1.05, eh*3]], true);
        ctx.clip();
        sline(R, circlePts(cix,ciy,irx,iry,20), 1.1, .6);
        wobblyEllipse(R,cix,ciy,irx,iry); ctx.fillStyle=inkA(.12); ctx.fill();
        for(let k=0;k<4;k++){
          const a=rr(R,.3,.7)+k*1.5;
          sline(R,[[cix+Math.cos(a)*irx*.35, ciy+Math.sin(a)*iry*.35],
                   [cix+Math.cos(a)*irx*.85, ciy+Math.sin(a)*iry*.85]],1,.13);
        }
        ctx.save();
        wobblyEllipse(R,cix,ciy,irx,iry); ctx.clip();
        if(chance(R,.45)){
          ctx.fillStyle=inkA(.45);
          ctx.fillRect(cix-irx, ciy-iry, irx*2, iry*.5);
        } else {
          for(let k=0;k<5;k++)
            sline(R,[[cix-irx, ciy-iry+k*iry*.13+rr(R,-.5,.5)],[cix+irx, ciy-iry+k*iry*.15+rr(R,-.5,.5)]],1.3,.4);
        }
        ctx.restore();
        ctx.fillStyle=inkA(.95);
        wobblyEllipse(R,cix, ciy+eh*.06, irx*.4, iry*.46); ctx.fill();
        ctx.fillStyle=PAPER;
        wobblyEllipse(R,cix-irx*.42, ciy-iry*.24, irx*.42, irx*.42); ctx.fill();
        wobblyEllipse(R,cix+irx*.34, ciy+iry*.42, irx*.17, irx*.17); ctx.fill();
        ctx.restore();
        stroke(R, lash, lashW, {taper:.15, over:s*.012});
        stroke(R,[[ecx+sd*ew*.92, -eh*(.22+fierce*.5)],[ecx+sd*ew*1.28, -eh*(.5+fierce*.6)]], lashW*.75, {wedge:true});
        if(T.eyeType==='big' && chance(R,.7))
          stroke(R,[[ecx+sd*ew*.8, -eh*.5],[ecx+sd*ew*1.1, -eh*.95]], lashW*.5, {wedge:true});
        sline(R,[[ecx-sd*ew*.95, eh*.12],[ecx-sd*ew*1.02, eh*.35]], lwThin*.8, .55);
        sline(R,[[ecx+sd*ew*.15, eh*1.05],[ecx+sd*ew*.9, eh*.72]], lwThin*.85, .5);
        if(chance(R,.3)) sline(R,[[ecx-sd*ew*.4,-eh*1.25],[ecx+sd*ew*.5,-eh*1.5]],1,.14);
        if(T.eyeType==='narrow' && chance(R,.5)) sline(R,[[ecx-sd*ew*.3, eh*1.5],[ecx+sd*ew*.5, eh*1.3]],1,.16);
        ctx.restore();
      }
    }

    /* ---- glasses: the one dev signal that gets to be common ---- */
    function layerGlasses(){
      if(!T.glasses) return;
      const g = T.glasses;
      const dark = g==='shades', tint = g==='aviator', heavy = dark||tint;
      const th = g==='thin' ? lwThin*.85 : heavy ? lwThin*1.6 : lwThin*1.25;
      const alpha = g==='thin' ? .55 : heavy ? .85 : .75;
      const lens = sd => {
        const ex=eyeX(sd), ew=eyeW(sd);
        if(g==='round') return circlePts(ex, eh*.2, ew*1.22, eh*1.75, 18);
        if(tint)   // teardrop: wide across the brow, tapering in toward the cheek
          return chaikin([[ex-ew*1.34, -eh*1.55],[ex+ew*1.34, -eh*1.55],
                          [ex+ew*1.16, eh*1.0],[ex+sd*ew*.12, eh*2.25],
                          [ex-ew*1.16, eh*1.0]], true, 2);
        const rx = dark ? ew*1.46 : ew*1.26, ry = dark ? eh*1.9 : eh*1.6;
        return chaikin([[ex-rx,-ry+eh*.2],[ex+rx,-ry+eh*.2],[ex+rx*.96,ry+eh*.2],[ex-rx*.96,ry+eh*.2]],true,1);
      };
      for(const sd of[-1,1]){
        const lp = lens(sd);
        if(dark){                       // opaque: the eyes go away entirely
          paperFill(lp); pencilFill(R, lp, .95);
        } else if(tint){                // smoked, so the eye reads faintly through
          paperFill(lp); inkFill(lp,.30);
          hatchFill(R, lp, s*.028*K, rr(R,.7,1.2), .34, TW);
        } else {
          poly(lp,true); ctx.fillStyle=paperA(.30); ctx.fill();
        }
        // the glint, which is what makes a dark lens read as glass and not a hole
        if(chance(R, heavy?.85:.55)){
          const [lx0,ly0,lx1,ly1]=bbox(lp);
          sline(R,[[lx0+(lx1-lx0)*.14, ly1-(ly1-ly0)*.28],[lx0+(lx1-lx0)*.48, ly0+(ly1-ly0)*.18]],
                heavy?1.8:1.2, 0, paperA(heavy?.8:.6));
        }
        broken(R, lp.concat([lp[0]]), th, {ghost:heavy, alpha});
        sline(R,[[eyeX(sd)+sd*eyeW(sd)*1.3, eh*.05],[sd*w*1.02, -s*.05]], th*.85, alpha*.8);
      }
      sline(R,[[eyeX(-1)+eyeW(-1)*1.24, eh*.05],[eyeX(1)-eyeW(1)*1.24, eh*.05]], th*.9, alpha*.85);
      if(tint)                          // aviators carry the extra brow bar
        sline(R,[[eyeX(-1)-eyeW(-1)*1.34, -eh*1.5],[eyeX(1)+eyeW(1)*1.34, -eh*1.5]], th*.8, alpha*.7);
    }

    /* ---- nose, mouth, stubble ---- */
    function layerFeatures(){
      const nxp = turn*w*.5;
      const mw=w*.30*(1-.25*at), my=s*.58, mx=fx*1.15;

      stroke(R, chaikin([[fx*.85+w*.01, s*.12],[nxp+w*.01, s*.3],[nxp+ts*w*.07*at+w*.02, s*.42]],false,1), lwThin, {taper:.3});
      if(chance(R,.6)) sline(R,[[nxp+w*.02, s*.43],[nxp-ts*w*.07, s*.455]],1.1,.5);
      hatch(R,nxp-w*.07,s*.38,s*.03,s*.05,-1.1,2,.11);
      if(chance(R,.2))
        stroke(R,[[mx-mw*.8+rr(R,-.04,.04)*w, my+rr(R,-.035,.035)*s],
                  [mx+mw*.7+rr(R,-.04,.04)*w, my+rr(R,-.035,.035)*s]], lwThin, {taper:.3, alpha:.18});

      const ms = T.mouthStyle;
      if(ms==='flat') stroke(R,[[mx-mw,my],[mx+mw*.9,my+rr(R,-.02,.02)*s]],lwThin*1.1,{taper:.25,over:s*.02});
      else if(ms==='frown') stroke(R,chaikin([[mx-mw,my-s*.02],[mx,my+s*.025],[mx+mw*.9,my-s*.025]],false,1),lwThin*1.1,{taper:.25});
      else if(ms==='smirk') stroke(R,chaikin([[mx-mw*.7,my+s*.01],[mx+mw*.5,my-s*.005],[mx+mw*.95,my-s*.045]],false,1),lwThin*1.1,{taper:.25});
      else if(ms==='soft'){
        // a small, closed, unforced smile — the most common expression here
        stroke(R,chaikin([[mx-mw*.85,my-s*.012],[mx,my+s*.022],[mx+mw*.85,my-s*.018]],false,2),lwThin*1.05,{taper:.28});
        for(const sd of[-1,1])
          if(chance(R,.45)) sline(R,[[mx+sd*mw*.95, my-s*.03],[mx+sd*mw*1.02, my+s*.01]],1,.3);
      } else {
        stroke(R,[[mx-mw*.7,my],[mx+mw*.7,my]],lwThin*1.1,{taper:.25});
        inkFill([[mx-mw*.32,my+s*.008],[mx+mw*.32,my+s*.008],[mx+mw*.2,my+s*.05],[mx-mw*.2,my+s*.05]],.7);
      }
      if(chance(R,.3)) sline(R,[[fx-w*.1,s*.7],[fx+w*.12,s*.71]],1,.16);

      if(T.stubble){
        ctx.save(); poly(facePoly,true); ctx.clip();
        const n = Math.round(ri(R,50,90)*DETAIL);
        for(let i=0;i<n;i++){
          const x = fx*1.1 + rr(R,-.72,.72)*w;
          const y = s*rr(R,.5,T.chinY*1.02);
          if(Math.abs(x-mx) < mw*.8 && Math.abs(y-my) < s*.04) continue;
          ctx.fillStyle=inkA(rr(R,.12,.34));
          ctx.fillRect(x, y, rr(R,.7,1.4), rr(R,.7,1.4));
        }
        ctx.restore();
      }
      if(T.freckles){
        for(let i=0;i<ri(R,6,10)*DETAIL;i++){
          ctx.fillStyle=inkA(rr(R,.2,.4));
          ctx.fillRect(fx+rr(R,-.55,.55)*w, s*rr(R,.24,.4), 1.2, 1.2);
        }
      }
      if(T.bandage){
        ctx.save();
        ctx.translate(T.markSide*w*.52+fx*.4, s*.3);
        ctx.rotate(rr(R,-.6,.6));
        for(const a2 of [0, Math.PI/2*rr(R,.8,1.2)]){
          ctx.save(); ctx.rotate(a2);
          paperFill([[-s*.08,-s*.025],[s*.08,-s*.025],[s*.08,s*.025],[-s*.08,s*.025]]);
          sline(R,[[-s*.08,-s*.025],[s*.08,-s*.025]],1,.4);
          sline(R,[[-s*.08,s*.025],[s*.08,s*.025]],1,.4);
          ctx.restore();
          if(chance(R,.5)) break;
        }
        ctx.restore();
      }
      if(T.faceMark==='mole'){
        ctx.fillStyle=inkA(.6);
        ctx.beginPath(); ctx.arc(fx+T.markSide*w*rr(R,.3,.5), s*rr(R,.35,.55), s*.011, 0, TAU); ctx.fill();
      } else if(T.faceMark==='scar'){
        const y0=rr(R,-.15,.25)*s;
        stroke(R,[[T.markSide*w*.35,y0-s*.12],[T.markSide*w*.7,y0+s*.16]],lwThin*.8,{taper:.3,alpha:.5});
      }
    }

    /* ---- hair, front layer ---- */
    function layerHairFront(){
      if(T.hairColC) CUR_INK = T.hairColC;
      const hs = T.hairStyle, bt = T.bangType;
      if(bt==='clumps' || bt==='ragged' || bt==='straight'){
        const topY=-s*(T.skullY-.03);
        const bp=[[-.98*w,-.52*s],[-.5*w,topY*.9],[turn*w*.12,topY*.98],[.5*w,topY*.9],[.98*w,-.52*s]];
        const bots=[];
        if(bt==='straight'){
          for(let i=0;i<9;i++){
            const x=.95*w - i*(1.9*w/8);
            bots.push([x, s*(-.26+((i%2)?-.03:.01)+rr(R,-.01,.01))]);   // clear of the eyes
          }
        } else {
          const n = bt==='ragged' ? ri(R,9,12) : ri(R,5,7);
          const cpart = chance(R,.35);
          for(let i=0;i<n;i++){
            const xr=.95*w - i*(1.9*w/n);
            const xt=xr-(1.9*w/n)*.5+rr(R,-.2,.2)*(1.9*w/n);
            let tip = bt==='ragged' ? rr(R,-.22,.06) : rr(R,-.06,.22);
            if(bt==='clumps' && chance(R,.08)) tip=rr(R,.26,.32);
            if(cpart && Math.abs(xt-turn*w*.15)<w*.22) tip=-.5;
            bots.push([xr, s*rr(R,-.38,-.24)],[xt, s*tip]);
          }
        }
        const bpoly=chaikin([...bp,[.99*w,-.5*s],...bots,[-.99*w,-.5*s]],true,1);
        toneFill(bpoly);
        const faintEdge = T.hairTone==='light' || T.hairTone==='stipple';
        stroke(R,chaikin([[.99*w,-.5*s],...bots,[-.99*w,-.5*s]],false,1),
               faintEdge?lwThin*.95:lwThin*1.3,
               faintEdge?{amp:.9,alpha:.5}:{ghost:true,amp:.9});
        if(['mullet','ponytail','braids','wavy'].includes(hs)) broken(R,chaikin(bp,false,1),lwThin*1.3,{});
        if(T.hairTone==='light')
          for(let i=0;i<ri(R,4,7);i++){
            const x0=rr(R,-.7,.7)*w;
            sline(R,[[x0,-s*.72],[x0+rr(R,-.12,.12)*w, s*rr(R,-.35,-.05)]],1.2,.28);
          }
      } else if(bt==='sweep'){
        // stops well above the jaw now — it used to fall to s*.45 and, once the
        // pale tone actually filled, read as a wedge laid across the face
        const d=T.modSide;
        hairPiece(capPts());              // an undercut still has hair on top of the head
        const sw = chaikin([[-d*.34*w,-s*T.skullY],[d*.62*w,-s*(T.skullY-.01)],[d*1.12*w,-.52*s],
                            [d*1.09*w,-.14*s],[d*.84*w,s*.10],[d*.52*w,-.14*s],
                            [d*.16*w,-.42*s],[-d*.34*w,-.62*s]],true,2);
        hairPiece(sw);
        // strands, so it reads as hair falling across the brow
        ctx.save(); poly(sw,true); ctx.clip();
        const dark = T.hairTone==='black';
        for(let i=0;i<ri(R,5,8);i++)
          sline(R, chaikin([[-d*w*rr(R,.1,.3), -s*(T.skullY*.9)],
                            [ d*w*rr(R,.4,.8),  -s*rr(R,.3,.55)],
                            [ d*w*rr(R,.82,1.04), -s*rr(R,.02,.26)]],false,2),
                lwThin*rr(R,.75,1.15), dark?0:.32, dark?paperA(.45):undefined);
        ctx.restore();
        for(let i=0;i<18*DETAIL;i++){
          ctx.fillStyle=inkA(rr(R,.18,.42));
          ctx.fillRect(-d*rr(R,.25,.8)*w, -s*rr(R,.56,T.skullY*.92), 1.4, 1.4);
        }
      } else if(hs==='spiky'){
        const cap=capPts();
        toneFill(cap);
        broken(R,chaikin(hairlinePts,false,1),lwThin*1.1,{alpha:.6});
        for(let i=0;i<ri(R,4,6);i++){
          const t=rr(R,.1,.9);
          const hx=(t-.5)*1.5*w, hy=(-.66+Math.abs(t-.5)*.22)*s;
          const p=[[hx-w*.08,hy],[hx+rr(R,-.06,.06)*w, hy+s*rr(R,.14,.3)],[hx+w*.09,hy]];
          toneFill(p); sline(R,p,1.3,.55);
        }
      // ponytail and mullet reach here only when they rolled no fringe. Without
      // this they drew a tail and no cap — a bare skull with a flap beside it.
      } else if(['slick','buns','braids','dreads','ponytail','mullet'].includes(hs)){
        hairPiece(capPts());
        if(T.hairTone!=='black' && hs==='slick')
          for(let i=0;i<6;i++){
            const x0=(-0.62+i*.25)*w;
            sline(R,chaikin([[x0,-.6*s],[x0*.7,-.8*s],[x0*.5,-.95*s]],false,1),1.2,.32);
          }
      } else if(hs==='bowl'){
        const fringeY=-s*.16;
        const bot=[];
        for(let i=0;i<7;i++){
          const x=.95*w - i*(1.9*w/6);
          bot.push([x, fringeY+((i===2||i===5)?s*.035:0)+rr(R,-.008,.008)*s]);
        }
        hairPiece(chaikin([[-.97*w,fringeY-.02*s],[-.99*w,-.5*s],[-.8*w,-s*T.skullY*.78],[turn*w*.1,-s*(T.skullY+.04)],
                           [.8*w,-s*T.skullY*.78],[.99*w,-.5*s],[.97*w,fringeY-.02*s],...bot],true,1), {lw:lwMain});
      } else if(hs==='curly'){
        const mass=blobPts(R, turn*w*.1, -s*.6, w*1.12, s*.62);
        toneFill(mass);
        broken(R, mass.concat([mass[0]]), lwThin*1.1, {alpha:.5, amp:1.5});
        const [mx0,my0,mx1,my1]=bbox(mass);
        ctx.save(); poly(mass,true); ctx.clip();
        const curlC = T.hairTone==='black';
        // arcs of 3.4–5.4 rad are nearly closed rings, which read as chain links.
        // C-shapes of varied radius read as curls.
        for(let i=0;i<ri(R,28,40)*DETAIL;i++)
          curl(R, rr(R,mx0,mx1), rr(R,my0,my1), s*rr(R,.030,.075), rr(R,0,TAU), rr(R,1.9,3.3),
               curlC ? paperA(rr(R,.5,.75)) : inkA(rr(R,.4,.75)), rr(R,1.2,2.3));
        ctx.restore();
        for(let i=0;i<ri(R,3,5);i++){
          const a=rr(R,-.2,Math.PI+.2);
          curl(R, turn*w*.1-Math.cos(a)*w*1.12, -s*.6-Math.sin(a)*s*.62,
               s*rr(R,.03,.055), rr(R,0,TAU), rr(R,2.0,3.0), inkA(rr(R,.4,.65)), 1.5);
        }
      } else if(hs==='mohawk'){
        const cap=capPts();
        stippleFill(R, cap, s*.03, .35);
        sline(R,chaikin(hairlinePts,false,1),1.2,.45);
        const nsp=ri(R,4,6);
        for(let i=0;i<nsp;i++){
          const bx=turn*w*.1+(i-(nsp-1)/2)*w*.13;
          const by=-s*(T.skullY*.92 - Math.abs(i-(nsp-1)/2)*.05);
          const p=[[bx-w*.07,by],[bx+rr(R,-.05,.05)*w, by-s*rr(R,.2,.32)],[bx+w*.08,by]];
          toneFill(p); sline(R,p,1.3,.6);
        }
      } else if(hs==='buzz'){
        sline(R,chaikin(hairlinePts,false,1),1.3,.5);
        stippleFill(R, capPts(), s*.026, .42);
        broken(R, chaikin([[-w*.8,-s*T.skullY*.72],[turn*w*.12,-s*T.skullY*1.02],[w*.8,-s*T.skullY*.72]],false,2), lwMain*.9, {ghost:true});
      }
      // the highlight the pencil leaves along the crown
      if(T.hairTone!=='light' && T.hairTone!=='stipple' && ['bob','long','hime','ponytail','messy','slick','wavy','bowl'].includes(hs)){
        const zz=[];
        for(let i=0;i<9;i++) zz.push([(-.72+i*.18)*w, s*(-.63+((i%2)?.05:-.02)+rr(R,-.008,.008))]);
        sline(R,zz,s*.05*K,0,paperA(T.hairTone==='black'?.7:.45));
      }
      CUR_INK = INK;
    }

    /* ---- worn over the hair ---- */
    /* Headwear. Drawn over the hair, filled hard, so it carries real value on
       the page instead of being another pale outline. */
    function hatFill(pts){
      paperFill(pts);
      if(T.hatC) CUR_INK = T.hatC;
      if(T.hatDark) pencilFill(R, pts, .95);
      else if(T.hatTex==='hatch'){ inkFill(pts,.07); hatchFill(R, pts, s*.038*K, rr(R,1.0,1.6), .40, TW); }
      else if(T.hatTex==='stipple'){ inkFill(pts,.05); stippleFill(R, pts, s*.028*K, .5); }
      else inkFill(pts,.12);
      CUR_INK = INK;
      broken(R, pts.concat([pts[0]]), lwThin*1.45, {ghost:true});
    }

    function layerHeadwear(){
      const hw = T.headwear;
      if(!hw) return;
      const HB = -s*(T.skullY*.62);                       // where the hat meets the brow
      // a brim in the same tone as the crown disappears into it; this line lifts
      // the crown edge off the brim so the two planes separate
      const seam = (a,b) => sline(R, chaikin([a,[(a[0]+b[0])/2, (a[1]+b[1])/2 - s*.03], b],false,2),
                                  lwThin*1.3, 0, paperA(.7));
      // squat crowns read as berets; caps need height
      const tall = hw==='cowboy' ? 1.46 : (hw==='cap'||hw==='capback') ? 1.34 : 1.24;
      const HT = -s*(T.skullY*tall);
      const bx = turn*w*.34;

      if(hw==='band'){
        const y0=-s*.50, y1=-s*.33;
        const band = chaikin([[-w*1.04,y0],[bx*.4,y0-s*.035],[w*1.04,y0],
                              [w*1.02,y1],[bx*.4,y1-s*.02],[-w*1.02,y1]],true,1);
        hatFill(band);
        if(chance(R,.5))                                   // studs along it
          for(let i=0;i<ri(R,3,6);i++){
            ctx.fillStyle = paperA(.75);
            const t=(i+.5)/6;
            ctx.fillRect(-w*1.0+t*w*2.0, y0+s*.055, s*.026, s*.026);
          }
        return;
      }

      if(hw==='visor'){                                    // brim and band, no crown
        const brim = chaikin([[-w*1.04, HB+s*.05],[-w*.86+bx, HB+s*.22],[bx, HB+s*.29],
                              [w*.86+bx, HB+s*.22],[w*1.04, HB+s*.05],
                              [w*1.0, HB-s*.01],[bx, HB+s*.10],[-w*1.0, HB-s*.01]],true,2);
        hatFill(brim);
        sline(R, chaikin([[-w*1.02,HB-s*.02],[bx*.5,HB-s*.10],[w*1.02,HB-s*.02]],false,2), lwThin*1.5, .7);
        return;
      }

      // everything else has a crown
      const crownW = hw==='cowboy' ? .84 : 1.05;
      const crown = chaikin([
        [-w*crownW, HB+s*.02],[-w*crownW*.96, HT*.84],[bx*.3-w*.34, HT*1.02],
        [bx*.3, HT],[bx*.3+w*.34, HT*1.02],[w*crownW*.96, HT*.84],[w*crownW, HB+s*.02]
      ], true, 2);
      hatFill(crown);

      if(hw==='cap'){
        // wider than the crown, so its silhouette breaks the head outline
        const brim = chaikin([[-w*1.18, HB+s*.03],[-w*1.0+bx, HB+s*.22],[bx, HB+s*.30],
                              [w*1.0+bx, HB+s*.22],[w*1.18, HB+s*.03],
                              [w*1.02, HB-s*.03],[bx, HB+s*.07],[-w*1.02, HB-s*.03]],true,2);
        hatFill(brim);
        seam([-w*1.02, HB-s*.01],[w*1.02, HB-s*.01]);
        for(let i=0;i<2;i++)                                // panel seams
          sline(R, chaikin([[bx*.3+(i?1:-1)*w*.3, HB],[bx*.3+(i?1:-1)*w*.16, HT*.9]],false,1), lwThin, .35);
        ctx.fillStyle=inkA(.7);
        ctx.beginPath(); ctx.arc(bx*.3, HT*1.02, s*.026, 0, TAU); ctx.fill();
      } else if(hw==='capback'){
        const d = -(Math.sign(turn)||1);                    // brim points away from the gaze
        const tab = chaikin([[d*w*.95, HB-s*.03],[d*w*1.32, HB+s*.03],[d*w*1.28, HB+s*.13],
                             [d*w*.93, HB+s*.09]],true,1);
        hatFill(tab);
        // the adjuster gap at the front
        sline(R,[[-w*.3+bx, HB+s*.01],[w*.3+bx, HB+s*.01]], lwThin*1.4, .6);
        sline(R,[[bx, HB-s*.05],[bx, HB+s*.05]], lwThin*1.1, .5);
      } else if(hw==='beanie'){
        const fold = chaikin([[-w*1.09, HB-s*.02],[bx*.4, HB+s*.08],[w*1.09, HB-s*.02],
                              [w*1.07, HB-s*.19],[bx*.4, HB-s*.10],[-w*1.07, HB-s*.19]],true,1);
        paperFill(fold);
        hatchFill(R, fold, s*.03*K, 1.5, .34, TW);
        broken(R, fold.concat([fold[0]]), lwThin*1.25, {alpha:.75});
        if(chance(R,.4)){
          const pom = circlePts(bx*.3, HT*1.06, s*.08, s*.075, 12);
          hatFill(pom);
        }
      } else if(hw==='bucket'){
        const brim = chaikin([[-w*1.42, HB+s*.02],[-w*1.12, HB+s*.23],[bx*.3, HB+s*.30],
                              [w*1.12, HB+s*.23],[w*1.42, HB+s*.02],
                              [w*1.02, HB-s*.05],[bx*.3, HB-s*.01],[-w*1.02, HB-s*.05]],true,2);
        hatFill(brim);
        seam([-w*1.04, HB-s*.02],[w*1.04, HB-s*.02]);
      } else if(hw==='cowboy'){
        const bY = HB + s*.05;
        const brim = chaikin([[-w*1.78, bY-s*.10],[-w*1.2, bY+s*.09],[bx*.3, bY+s*.14],
                              [w*1.2, bY+s*.09],[w*1.78, bY-s*.10],
                              [w*1.15, bY-s*.05],[bx*.3, bY],[-w*1.15, bY-s*.05]],true,2);
        hatFill(brim);
        seam([-w*.86, bY-s*.06],[w*.86, bY-s*.06]);
        // the pinch down the front of the crown, and a band at its base
        sline(R, chaikin([[bx*.3, HT*1.0],[bx*.3, HT*.72],[bx*.3, HB+s*.02]],false,2), lwThin*1.2, 0, paperA(.5));
        sline(R,[[-w*.84, HB-s*.05],[bx*.3, HB],[w*.84, HB-s*.05]], lwThin*2.2, .65);
      }
    }

    function layerWorn(earSides){
      layerHeadwear();
      if(T.headphones){
        // heavy band and solid cups: this is the loudest thing on the page
        const overHat = T.headwear && T.headwear!=='band' && T.headwear!=='visor';
        const bandR = overHat ? s*1.22 : s*1.06;
        sline(R, arcPts(0, -s*.02, w*1.18, bandR, Math.PI*1.05, Math.PI*1.95, 20), s*.044, .85);
        sline(R, arcPts(0, -s*.02, w*1.08, bandR*.93, Math.PI*1.2, Math.PI*1.8, 14), s*.022, .4);
        // cups sit on the ear, not floating beside it
        for(const sd of (earSides.length===1 ? earSides : [-1,1])){
          const cx0 = sd*w*.99;
          const cup=circlePts(cx0, s*.06, s*.108, s*.145, 16);
          paperFill(cup);
          pencilFill(R, cup, .95);
          broken(R, cup.concat([cup[0]]), lwThin*1.5, {ghost:true});
          sline(R, circlePts(cx0, s*.06, s*.055, s*.078, 12), 1.3, 0, paperA(.55));
          sline(R,[[cx0*1.02, -s*.20],[cx0, -s*.06]], lwThin*1.6, .8);
        }
      } else if(T.earbuds){
        for(const sd of (earSides.length===1 ? earSides : [-1,1])){
          const bud = circlePts(sd*w*1.02, s*.06, s*.032, s*.038, 10);
          paperFill(bud); sline(R, bud, lwThin, .7);
          ctx.fillStyle=inkA(.55);
          ctx.beginPath(); ctx.arc(sd*w*1.02, s*.06, s*.012, 0, TAU); ctx.fill();
          // the stem, and a wire falling out of frame
          sline(R,[[sd*w*1.02, s*.09],[sd*w*1.0, s*.2]], lwThin*1.1, .6);
          sline(R, chaikin([[sd*w*1.0, s*.2],[sd*w*1.06, s*.6],[sd*w*.9, s*1.1]],false,2), lwThin*.9, .45);
        }
      }
    }

    /* ---- masks ----
       Drawn over hair and face both, because a mask covers everything. Solid
       black is the point: this is the highest-contrast thing on the page. ---- */
    function layerHero(){
      if(!T.hero) return;
      // Fixed size, not scaled off eh. A narrow-eyed face was getting pinhole
      // slits, and a dark shape with two dots in it reads as a hat, not a cowl.
      const eyeHole = sd => {
        const ex0 = eyeX(sd), ew2 = Math.max(eyeW(sd), w*.21), hh = s*.085;
        return chaikin([[ex0-sd*ew2*1.22, -hh*.15],[ex0+sd*ew2*1.22, -hh*1.05],
                        [ex0+sd*ew2*1.08, hh*.85],[ex0-sd*ew2*1.00, hh*1.20]], true, 2);
      };

      if(T.hero==='web'){
        const hood = chaikin(circlePts(turn*w*.08, -s*.16, w*1.05, s*.98, 26), true, 1);
        paperFill(hood);
        CUR_INK = T.heroC || [168,72,60];
        inkFill(hood, .42);
        hatchFill(R, hood, s*.042*K, rr(R,.8,1.4), .48, TW);
        CUR_INK = INK;
        broken(R, hood.concat([hood[0]]), lwMain*.75, {ghost:true});
        // the webbing: spokes from the brow, then rings crossing them
        const wx = turn*w*.08, wy = -s*.40;
        for(let i=0;i<11;i++){
          const a = i/10*Math.PI*1.15 + Math.PI*(-.075);
          sline(R,[[wx,wy],[wx+Math.cos(a)*w*1.25, wy+Math.sin(a)*s*1.5]], lwThin*1.1, .55);
        }
        for(let k=1;k<=4;k++)
          sline(R, arcPts(wx, wy, w*1.15*k/4, s*1.35*k/4, .1, Math.PI-.1, 16), lwThin*.95, .5);
        // the big lenses
        for(const sd of[-1,1]){
          const ex0 = turn*w*.2 + sd*w*.44;
          const lens = chaikin([[ex0-sd*w*.34, s*.10],[ex0-sd*w*.16, -s*.20],
                                [ex0+sd*w*.30, -s*.12],[ex0+sd*w*.20, s*.14]], true, 2);
          paperFill(lens);
          broken(R, lens.concat([lens[0]]), lwMain*.8, {ghost:true});
          if(chance(R,.7))
            sline(R,[[ex0-sd*w*.2, s*.04],[ex0-sd*w*.02, -s*.12]], lwThin, 0, paperA(.5));
        }
        return;
      }

      if(T.hero==='bat'){
        const cowl = chaikin([[-w*1.02,-s*.02],[-w*1.04,-s*.52],[-w*.58,-s*.95],[turn*w*.1,-s*1.02],
                              [w*.58,-s*.95],[w*1.04,-s*.52],[w*1.02,-s*.02],
                              [w*.52,s*.10],[turn*w*.1,s*.20],[-w*.52,s*.10]],true,2);
        paperFill(cowl);
        CUR_INK = T.heroC || INK;
        pencilFill(R, cowl, .96);
        CUR_INK = INK;
        broken(R, cowl.concat([cowl[0]]), lwMain*.8, {ghost:true});
        for(const sd of[-1,1]){                       // taller, sharper ears
          const ear = chaikin([[sd*w*.42,-s*.92],[sd*w*.56,-s*1.62],[sd*w*.74,-s*.84]],true,1);
          paperFill(ear);
          CUR_INK = T.heroC || INK;
          pencilFill(R, ear, .96);
          CUR_INK = INK;
          broken(R, ear.concat([ear[0]]), lwThin*1.6, {ghost:true});
        }
        for(const sd of[-1,1]){
          const hole = eyeHole(sd);
          paperFill(hole);
          sline(R, hole.concat([hole[0]]), lwThin*1.2, .5);
        }
        // the brow ridge dropping to a point between the eyes — the cue that
        // separates a cowl from a beanie
        sline(R, chaikin([[eyeX(-1)+eyeW(-1)*.9, -s*.16],[turn*w*.1, -s*.02],
                          [eyeX(1)-eyeW(1)*.9, -s*.16]],false,2), lwThin*1.3, 0, paperA(.42));
        return;
      }

      // 'claw' — a mask across the brow with two swept points
      const mask = chaikin([[-w*1.34,-s*.92],[-w*.66,-s*.60],[turn*w*.1,-s*.50],
                            [w*.66,-s*.60],[w*1.34,-s*.92],
                            [w*1.06,-s*.30],[w*.88,s*.06],[turn*w*.1,-s*.04],
                            [-w*.88,s*.06],[-w*1.06,-s*.30]],true,2);
      paperFill(mask);
      CUR_INK = T.heroC || INK;
      pencilFill(R, mask, .96);
      CUR_INK = INK;
      broken(R, mask.concat([mask[0]]), lwMain*.8, {ghost:true});
      for(const sd of[-1,1]){
        const hole = eyeHole(sd);
        paperFill(hole);
        sline(R, hole.concat([hole[0]]), lwThin*1.1, .45);
      }
    }

    /* ---- the accidents that stay in ---- */
    function layerAccidents(){
      if(chance(R,.28)){
        for(let k=0;k<ri(R,1,2);k++){
          const x0=rr(R,-1.1,1.1)*w, y0=rr(R,-1,.9)*s, a=rr(R,0,TAU), len=s*rr(R,.15,.45);
          stroke(R,[[x0,y0],[x0+Math.cos(a)*len, y0+Math.sin(a)*len]], lwThin*rr(R,.6,1),
                 {taper:.4, alpha:rr(R,.1,.22), over:s*rr(R,0,.06)});
        }
      }
      if(chance(R,.08)){
        const x0=rr(R,-.9,.9)*w, y0=rr(R,-.8,.8)*s, ww=s*rr(R,.08,.16);
        for(let k=0;k<ri(R,3,5);k++)
          sline(R,[[x0-ww, y0+rr(R,-.4,.4)*ww],[x0+ww, y0+rr(R,-.4,.4)*ww]],1.4,.4);
      }
      // the eraser was here: streaks that lift the drawing, a ghost left behind
      if(chance(R,.22)){
        for(let k=0;k<ri(R,1,2);k++){
          const ex=rr(R,-.9,.9)*w, ey2=rr(R,-1,.6)*s;
          const ea=rr(R,-.9,.9), el=s*rr(R,.18,.4);
          const dx=Math.cos(ea), dy=Math.sin(ea);
          for(let j=0;j<ri(R,3,5);j++){
            const o=(j-2)*s*.024+rr(R,-.01,.01)*s;
            sline(R,[[ex-dx*el*.5-dy*o, ey2-dy*el*.5+dx*o],[ex+dx*el*.5-dy*o, ey2+dy*el*.5+dx*o]],
                  s*rr(R,.022,.04), 0, paperA(rr(R,.4,.62)));
          }
          for(let j=0;j<2;j++){
            ctx.fillStyle=inkA(rr(R,.08,.15));
            ctx.fillRect(ex+rr(R,-.5,.5)*el, ey2+rr(R,-.3,.3)*el, 1.5, 1.5);
          }
          if(chance(R,.35))
            stroke(R,[[ex-dx*el*.4, ey2-dy*el*.4],[ex+dx*el*.45, ey2+dy*el*.45]], lwThin*.9, {taper:.3, alpha:.45});
        }
      }
    }

    // ---- paint, in order ----
    layerHalo();
    layerScaffold();
    layerHairBack();
    layerNeck();
    layerFace();
    const earSides = layerEars();
    layerShading();
    layerScreenGlow();
    layerBlush();
    layerEyes();
    layerFeatures();
    layerHairFront();
    layerHero();
    layerGlasses();
    layerWorn(earSides);
    layerAccidents();

    ctx.restore();
    DETAIL = 1;
  }

  /* ---- the one entry point everything else will call ----
     The seed folds in presentation and variant, so "raj" as femme and "raj" as
     masc are two different, both-stable people — and each offers the same eight
     options every time you come back to choose. */
  const seedFor = (name, present='any', variant=0) =>
    hashStr(`${name} ${present} ${variant}`);

  function portrait(name, cell, opts={}){
    const present = opts.present ?? 'any';
    const R = mulberry32(seedFor(name, present, opts.variant ?? 0));
    const T = castTraits(R, present);
    if(opts.force) Object.assign(T, opts.force);   // audit mode pins traits
    drawPortrait(R, T, cell, opts);
    return T;
  }

  // which fringe each style wears, mirrored from castTraits so audits match
  const BANG_OF = {bob:'clumps', long:'clumps', messy:'ragged', hime:'straight',
                   undercut:'sweep', mullet:'clumps', braids:'clumps', wavy:'clumps',
                   ponytail:'clumps'};

  /* ==================== 7. lettering ====================
     A first pass at handwriting: a script face, then per-glyph jitter so it
     reads as written rather than typed. Good enough to prove the technique.
     ====================================================================== */

  // Caveat arrives through next/font in this vendored build, not an embed in
  // this file. The rest of the stack is only a guard for the moment before
  // the face loads.
  const HANDS = [opts.hand, 'Caveat', '"Bradley Hand"', '"Segoe Print"', 'cursive'].filter(Boolean);
  function handwrite(R, text, cx, cy, size, o={}){
    ctx.save();
    ctx.font = `600 ${size*1.18}px ${HANDS.join(',')}`;   // Caveat runs small
    ctx.textBaseline = 'alphabetic';
    const chars = [...text];
    const widths = chars.map(ch => ctx.measureText(ch).width);
    const spacing = size*(o.tracking ?? .02);
    const total = widths.reduce((a,b)=>a+b,0) + spacing*(chars.length-1);
    let x = cx - total/2;
    const baseTilt = rr(R,-.02,.02);
    for(let i=0;i<chars.length;i++){
      const t = i/(chars.length-1||1);
      ctx.save();
      // the line drifts off horizontal, and each letter sits a hair off it
      ctx.translate(x + widths[i]/2, cy + Math.sin(t*3.1+1)*size*.035 + rr(R,-.03,.03)*size);
      ctx.rotate(baseTilt + rr(R,-.05,.05));
      const sc = rr(R,.95,1.05);
      ctx.scale(sc, rr(R,.96,1.04));
      ctx.fillStyle = inkA(o.alpha ?? rr(R,.72,.9));
      ctx.fillText(chars[i], -widths[i]/2, 0);
      ctx.restore();
      x += widths[i] + spacing;
    }
    ctx.restore();
    return total;
  }

  // ---- END VENDORED SOURCE ----

  return { portrait, handwrite, castTraits };
}
