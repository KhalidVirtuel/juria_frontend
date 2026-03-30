"use client";
import { useScroll, useTransform } from "framer-motion";
import React from "react";
import { GoogleGeminiEffect } from "@/components/ui/google-gemini-effect";

export function GeminiEffectSection() {
  const ref = React.useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start center", "end center"],
  });

  const pathLengthFirst = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const pathLengthSecond = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const pathLengthThird = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const pathLengthFourth = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const pathLengthFifth = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <div
      className="h-full w-full relative flex items-center justify-center"
      ref={ref}
    >
      <div className="w-full h-full scale-100 opacity-60">
        <GoogleGeminiEffect
          pathLengths={[
            pathLengthFirst,
            pathLengthSecond,
            pathLengthThird,
            pathLengthFourth,
            pathLengthFifth,
          ]}
          title=""
          description=""
          className="relative top-0"
        />
      </div>
    </div>
  );
}
