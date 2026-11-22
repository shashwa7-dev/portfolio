# Vice Hunt: the roller ostrich and the candy gator

Date: 2026-11-23. Owner: Shashwat. Builds on `docs/superpowers/specs/2026-11-21-vice-hunt-rares-design.md` (the creature model, roles, glass, rig, finishes, reduced motion), which stays the authority for everything this document does not change.

Motion references (owner-approved in the visual companion, 2026-11-22 to 23; open them straight from disk, the backdrop is `vice-hunt-rares-bg.png` beside them): `docs/superpowers/reference/vice-hunt-ostrich-motion.html` (look B, "Sunset Leopard", is the chosen one; A and C stay in the file only as the rejected options) and `docs/superpowers/reference/vice-hunt-gator-motion.html`. They are throwaway code: copy the look, the feel and the numbers, not the code.

## Why

Two more rares, so the hunt keeps surprising people: a funny one you are meant to shoot (the ostrich) and a second creature that fights back (the gator), with a new kind of attack that gets in your way instead of only taking hearts. Both must look vivid and polished on the beach, like the rest of the rares.

## Goals

- **Roller ostrich**: a trophy rare. It skates along the sand and gets faster with every hit. The third hit plucks it bare and it rushes off screen on its skates, which spray fireworks.
- **Candy gator**: a hostile rare. It takes 5 or 6 hits, and every hit makes it angrier. Each hit, it shoots back with a candy-cane gun that sprays candies onto the screen. On the last hit it inflates and bursts into candy.
- Both are one record each in the creature registry, with the same module pattern as the other rares, and their own gentle versions under reduced motion.

## Non-goals

- New recorded sounds (as in the rares spec: existing effects are reused, sound picks come later).
- Phones and tablets (the mode is desktop only).
- Changing any existing creature.

## Anti-goals (a failure even if it works)

- Bullet holes, cracks or glass breaking. The candies are the gator's marks on the glass, like Bigfoot's splats, and they fade.
- A body that breaks apart while it moves. The ostrich loses feathers, but its body stays one piece. The gator swells as one body (head, torso and limbs stay joined) right up to the pop.
- Any sound in automated tests; anything from the game in the homepage's first load (`scripts/check-gta6-bundle.sh`).
- Dull colours. The owner asked for "very vibrant" patterns over realistic animal colours.

## Approaches considered

1. **Extend the registry and modules (chosen).** The ostrich is drawn from pre-rendered part images moved by canvas transforms (legs rotate about the hip, the neck nods); the gator is a jointed canvas rig like Bigfoot's; the candy gun is a new threat module; the stuck candies are a new kind of glass mark; the two finishes are new finish modules. This is the shape the rares spec set up ("adding a creature later is one record plus its art and finish").
2. **One-off code paths in `render.ts` and `index.ts` per creature.** Quicker for one creature, but it skips the exhaustive registries that make the compiler find every place a new creature must be handled. Rejected.

The owner said to proceed with the build after approving both mockups; approach 1 is the one the existing package is designed for.

## The roller ostrich

| Field | Value |
|---|---|
| Role | trophy (you are meant to shoot it) |
| Lane | ground |
| Hits | 3 |
| Points | 700 on the third hit (my call; between the shark's 600 and the UFO's 1000) |
| Rarity | 0.4 per minute, like the shark (my call) |
| Size | 96 x 133 px at 1x (the art's 130 x 180 box) |

**Look (owner: "very vibrant", look B, Sunset Leopard).** The body has an orange-to-pink gradient with purple leopard rosettes. The tail has teal and violet plumes, and the wing is pink with a teal tip line. The neck is golden with orange rings, and the head is golden with a violet crest and an orange-red beak. Roller skates: purple boots, teal wheels. Plucked: bare pink skin with goosebumps, shocked eyes, beak open, a blush; the neck, head colour and skates keep their colours so it still reads as the same bird.

**Movement.** It glides along the sand, pushing off one leg at a time (each leg swings back about the hip and returns), with a small bob, a nod of the neck and a slight tilt. Base speed is about 0.1 of the width per second (a ground rare's speed, like the shark's).

**Hits 1 and 2.** It flinches and shows "1 / 3" or "2 / 3". Feathers burst off in its colours and drift down, swaying, then fade: the tail on hit 1, the wing and the neck fluff on hit 2. It speeds up: x1.7 after hit 1, x2.6 after hit 2, easing up to the new speed over a moment, leaning forward more and kicking a few sparks off its skates while fast. The owner asked for this ("the speed of the ostrich will increase on every hit").

**Hit 3, finish `plucked` (+700).** Every remaining feather blows off. The bird goes bare and shocked, a "!!" pops over its head, and it shivers for about 0.5 s while its skates start to spark. Then it crouches (a quick squash), and rushes off in its facing direction, accelerating hard, legs pumping, leaning forward, with fireworks sprayed backwards off every wheel: sparks, little star bursts, white smoke. It leaves the screen and the finish ends when it is off screen and the last particle is gone.

**Gentle (reduced motion).** It still speeds up (that is play, not motion), but throws no sparks. Feathers fall straight down and fade. On the last hit the bare bird fades out where it stands over about 0.7 s.

## The candy gator

| Field | Value |
|---|---|
| Role | hostile (fights back once hit) |
| Lane | ground |
| Hits | 5 or 6, rolled per gator (owner) |
| Points | 1200 on the last hit (my call; more than the UFO, less than Bigfoot) |
| Rarity | 0.35 per minute (my call) |
| Size | 120 x 152 px at 1x (the rig's 170 x 215 box) |
| Hit counter | "n / of" is shown (the owner saw it in the mockup). Unlike Bigfoot there is no boss bar and no "ANGRY!" |

**Look (owner).** An alligator head on a person's body, standing on two feet with two arms. A white ribbed tank top with teal trim, broad shoulders, big biceps, hot pink shorts with a white stripe, white high-top sneakers with purple soles and a teal swoosh, a gold watch on the gun hand, a blue polka-dot bandana tied low with flapping tails. No chains and no jewellery (the owner removed them). The head is big and cartoon-like: long grinning snout with white teeth, heavy-lidded eyes, brows, a pink cheek.

**Rig (owner: "the skeleton ... like Bigfoot").** He is drawn as a jointed rig on the canvas: legs are two-bone IK to planted feet (knees bend), arms are forward kinematics from shoulders that follow the torso (elbows bend), the head sits on the neck and tilts, the torso leans. The biceps bulge, more when the arm comes up to aim. Pure pose maths (IK, poses, walk, aim, puff) is tested, drawing takes the context, like `rig/`.

**Anger.** Anger goes from 0 to 1 as hits land: `hits / (hp − 1)`, so he is fully red one hit before he dies. His skin, far limbs, darker scales and jaw are all computed from it: green, then yellow, orange and red (hue 135 down to 2). As anger rises he walks faster (0.065 to 0.125 of the width per second), takes bigger strides, leans forward, his brows sink and slant, his pupils shrink, and from halfway up he steams from the top of his head. A shout pops on each hit that he answers: "YO!?", "BACK OFF!", "THAT'S IT!", "GRRRR!", "AAARGH!!" (in that order; the last repeats).

**Shooting back: the candy gun.** Every hit that does not finish him starts one shot. Hits that land while he is already shooting are counted, and queue one more shot straight after.
- He stops walking, draws the gun into his hand, raises his arm to aim (the elbow straightens, the bicep bulges), squints and fires. While calm he twirls the gun as he draws and blows the "smoke" off afterwards with a wink; once anger passes halfway he skips the show and draws faster (the timeline shrinks by up to 1.9x).
- The gun is a gold revolver with a pink grip and a long red-and-white candy-cane barrel with a pink rounded tip (owner). There is no fire: a pink sugar puff and coloured sparkles at the tip, and "FWUMP!".
- One shot sprays `round(10 + 10 x anger)` candies, so 12 after the first hit and up to 20 when red (owner: "10, 20 candies"; anger is already above 0 on the first shot, as in the approved mockup). They tumble at the camera, growing, staggered by 25 ms each, spread around the middle of the screen (wider for bigger sprays).
- Candies come in five kinds, in the game's bright colours: a wrapped sweet, a swirl lollipop, a peppermint, a gumdrop and a candy heart. Stuck candies are 32 to 52 px across at a 1280 px stage (owner, 2026-11-23: "a bit smaller" than the mockup's 46 to 76).
- Each candy lands on the glass with a small squash and sticks for 4 s. Then it slides down a little and fades over 0.7 s.
- **Candies take shots.** A click on a stuck candy knocks it off the glass (it pops off with a spin and falls). The round is spent and nothing behind the candy is hit. This is the owner's "making it difficult for us to hit it".
- **Damage (my call):** each spray costs ½ heart when its first candy lands, but one gator can take at most 1.5 hearts in all (Bigfoot's cap). After that his candies still stick and block, they just do not hurt. Without a cap, five sprays could empty the hearts by themselves.

**Last hit, finish `candy-pop` (+1200).** His eyes bulge and his mouth goes "O". He gulps air in three puffs (each with a small overshoot). His torso widens and rounds out much more than it grows tall, his head grows a little, and a balloon shine appears on the tank top. His arms stick out sideways and flail, his feet dangle, and he lifts off the sand, wobbling. From a third of the way in, candies squeeze out of his sides, more as he gets tighter. He trembles hard for 0.4 s, then pops ("POP!"): a white flash and ring, about 100 candies bursting out in every direction that spin, arc over and rain down (owner: "bursting into 100 candies"), and his bandana and watch flutter down. These loose candies fly through the scene and never stick to the glass. The finish ends when every particle is gone.

**Gentle.** Shots: the candies appear on the glass where they would land, without flying, and fade in. Finish: he swells a little over 0.6 s and fades out with a few candies dropping straight down, no burst.

## Rules this adds or changes

- **Hostile creatures without a boss bar.** The registry's hostile role gains a second threat kind, `returns-fire` (the gator), beside `throws` (Bigfoot). Only throwers are provoked into periodic attacks and get the "ANGRY!" callout. Only a creature with `boss` shares the screen with another rare and hides its hit total; the gator counts as an ordinary rare (one at a time, Bigfoot aside) and shows "n / of".
- **The glass can take shots.** A new glass mark, the candy, is the only mark that does: `shoot` checks it first and knocks the top candy off. Every other mark still lets shots through.
- **Speed from hits.** A move module may change how fast its animal travels from its hit count (the ostrich's skate, the gator's swagger). The gator's swagger also stands still while he shoots.
- **Hit effects in the scene.** Feathers flying off a hit ostrich are scene particles (like the falls' poofs), added by the host loop when a creature with the `pluck` reaction is hit.
- **New callouts:** "!!", "FWUMP!", "POP!" and the gator's five shouts. They pop as words, like "SPLAT!".
- HUD names: "Roller ostrich" and "Candy gator". Both show up in the RARE menu and on the results card through the registry, like the other rares.

## Art

- The ostrich is pre-rendered SVG parts, drawn into the 130 x 180 box from the reference's `birdSVG` (look B): two full frames (for the HUD icon), and these extras: far leg and near leg (each with its skate), tail, feathered body, bare body, wing, neck and head, collar, and the shocked bare neck and head. The legs rotate about the hip (58, 100) and the neck about its base (80, 74) at draw time. The source is a TypeScript module that builds the SVG strings (`src/art/ostrich.ts`), checked by the same SVG-document test as the other rares.
- The gator is drawn on the canvas from the rig (paths for the head, torso, tank top, shorts and sneakers; strokes and ellipses for limbs and biceps; the gun from paths), with colours computed from anger. His two HUD frames are static SVGs of the calm pose, made from the reference.
- Candies are drawn with canvas paths in any colour (one function per kind), shared by the stuck candies, the flying ones and the burst.

## What is left to the builder

Exact timings within the reference's feel; the particle counts for sparks and smoke; how the candy kinds are coloured per piece (random from the palette, one or two colours each); where the "!!" and shouts sit over the head.
