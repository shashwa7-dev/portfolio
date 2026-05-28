"use client";

import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { Home, ArrowLeft } from "lucide-react";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import {
  dialogPopVariants,
  slideUpVariants,
  fadeInVariants,
  duration,
} from "@/lib/motionVariants";

export default function NotFound() {
  const router = useRouter();

  return (
    <main className="min-h-screen relative">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 pt-32 pb-16 flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="text-center space-y-8 w-full">
          {/* Profile Image */}
          <motion.div
            variants={dialogPopVariants}
            initial="hidden"
            animate="visible"
            className="flex justify-center"
          >
            <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden ring-2 ring-border">
              <Image
                src="/favicon.svg"
                alt="Shashwat Tripathi"
                fill
                className="object-cover"
                priority
              />
            </div>
          </motion.div>

          {/* Animated 404 */}
          <motion.h1
            variants={slideUpVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.2 }}
            className="text-9xl md:text-[12rem] font-bold tracking-tight flex items-center justify-center gap-2"
          >
            <span className="bg-gradient-to-br from-foreground via-foreground to-muted-foreground bg-clip-text text-transparent">
              4
            </span>
            <span className="text-accent">0</span>
            <span className="bg-gradient-to-br from-foreground via-foreground to-muted-foreground bg-clip-text text-transparent">
              4
            </span>
          </motion.h1>

          {/* Message */}
          <motion.div
            variants={slideUpVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            <h2 className="text-2xl md:text-3xl font-semibold">
              Page Not Found
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto leading-relaxed">
              The page you're looking for doesn't exist or has been moved. Let's
              get you back on track.
            </p>
          </motion.div>

          {/* Actions */}
          <motion.div
            variants={slideUpVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
          >
            <Button
              onClick={() => router.push("/")}
              size="lg"
              className="group"
            >
              <Home className="w-4 h-4" />
              Go Home
            </Button>
            <Button
              onClick={() => router.back()}
              variant="outline"
              size="lg"
              className="group"
            >
              <ArrowLeft className="w-4 h-4" />
              Go Back
            </Button>
          </motion.div>

          {/* Decorative elements */}
          <motion.div
            variants={fadeInVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.6, duration: duration.hero * 2 }}
            className="pt-12 space-y-2"
          >
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <span className="w-1 h-1 rounded-full bg-accent animate-pulse" />
              <span>Lost in the void</span>
              <span className="w-1 h-1 rounded-full bg-accent animate-pulse" />
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
