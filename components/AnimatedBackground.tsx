"use client";

import {
    AnimatePresence,
    motion,
    useReducedMotion,
    useScroll,
    useTransform,
    type MotionValue,
} from "motion/react";

type ScrollMap = {
    x: number[];
    y: number[];
    scale: number[];
    xOut: number[];
    yOut: number[];
    scaleOut: number[];
};

const blobConfig: { className: string; scrollMap: ScrollMap }[] = [
    {
        className:
            "absolute -top-[40%] -left-[20%] w-[60vmax] h-[60vmax] rounded-full opacity-[0.12] dark:opacity-[0.1] blur-3xl",
        scrollMap: {
            x: [0, 0.4, 0.7, 1],
            y: [0, 0.4, 0.7, 1],
            scale: [0, 0.5, 1],
            xOut: [0, 140, 180, 220],
            yOut: [0, 60, 180, 320],
            scaleOut: [1, 1.02, 1.04],

        },
    },

];

function ScrollBlob({
    className,
    scrollMap,
    progress,
    reduceMotion,
}: {
    className: string;
    scrollMap: ScrollMap;
    progress: MotionValue<number>;
    reduceMotion: boolean | null;
}) {
    const x = useTransform(progress, scrollMap.x, scrollMap.xOut);
    const y = useTransform(progress, scrollMap.y, scrollMap.yOut);
    const scale = useTransform(progress, scrollMap.scale, scrollMap.scaleOut);

    return (
        <motion.div
            className={className}
            style={{
                background: "hsl(var(--accent)/0.6)",
                ...(reduceMotion ? {} : { x, y, scale }),
            }}
        />
    );
}


// const GRAIN_SVG_VARIANT_A = `data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E`;
const GRAIN_SVG_VARIANT_B = `data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch' result='noise'/%3E%3CfeColorMatrix type='matrix' values='0.08 0 0 0 0 0 0.08 0 0 0 0 0 0.08 0 0 0 0 0 1 0' in='noise'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E`;

export function AnimatedBackground() {
    const reduceMotion = useReducedMotion();
    const { scrollYProgress } = useScroll();

    return (
        <AnimatePresence>
            <motion.div
                key="animated-background"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 3 }}
                className="fixed inset-0 z-0 pointer-events-none overflow-hidden opacity-50"
                aria-hidden="true"
            >
                {blobConfig.map((blob, i) => (
                    <ScrollBlob
                        key={i}
                        className={blob.className}
                        scrollMap={blob.scrollMap}
                        progress={scrollYProgress}
                        reduceMotion={!!reduceMotion}
                    />
                ))}
                <div
                    className="absolute inset-0 opacity-[0.5] dark:opacity-[0.4] mix-blend-multiply"
                    style={{
                        backgroundImage: `url("${GRAIN_SVG_VARIANT_B}")`,
                        backgroundSize: "180px 180px",
                    }}
                    aria-hidden="true"
                />
            </motion.div>
        </AnimatePresence>
    );
}
