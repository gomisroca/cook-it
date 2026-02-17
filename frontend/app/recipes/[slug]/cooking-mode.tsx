"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { AnimatePresence, motion } from "framer-motion";

function CookingModeDisplay({
  steps,
  onClose,
}: {
  steps: Recipe["steps"];
  onClose: () => void;
}) {
  const [currentStep, setCurrentStep] = useState(0);

  const step = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  const paginate = (direction: number) => {
    setCurrentStep((prev) => {
      const next = prev + direction;
      if (next < 0 || next >= steps.length) return prev;
      return next;
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      {/* Top Bar */}
      <div className="p-6 space-y-4 border-b">
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">
            Step {currentStep + 1} of {steps.length}
          </span>

          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Progress Bar */}
        <Progress value={progress} className="h-2" />
      </div>

      {/* Swipeable Step Area */}
      <div className="flex-1 flex items-center justify-center overflow-hidden px-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={(e, info) => {
              if (info.offset.x < -100) paginate(1); // Swipe left → next
              if (info.offset.x > 100) paginate(-1); // Swipe right → prev
            }}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.25 }}
            className="w-full max-w-3xl text-center space-y-8"
          >
            <div className="text-6xl font-bold text-primary">
              {currentStep + 1}
            </div>

            <p className="text-2xl font-medium leading-relaxed">
              {step.instruction}
            </p>

            {step.imageUrl && (
              <div className="relative w-full h-[300px] rounded-2xl overflow-hidden shadow-lg">
                <Image
                  src={step.imageUrl}
                  alt={`Step ${currentStep + 1}`}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            {step.duration && (
              <p className="text-muted-foreground text-lg">
                ⏱ {step.duration} minutes
              </p>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Desktop Navigation Buttons */}
      <div className="p-6 border-t flex justify-between">
        <Button
          variant="secondary"
          disabled={currentStep === 0}
          onClick={() => paginate(-1)}
        >
          Previous
        </Button>

        <Button
          disabled={currentStep === steps.length - 1}
          onClick={() => paginate(1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}

export default function CookingMode({ steps }: { steps: Recipe["steps"] }) {
  const [isCooking, setIsCooking] = useState(false);

  return (
    <>
      <Button
        size="lg"
        className="rounded-2xl fixed bottom-6 left-1/2 -translate-x-1/2 z-50 lg:relative lg:bottom-auto lg:left-auto lg:-translate-x-0 "
        onClick={() => setIsCooking(true)}
      >
        🍳 Start Cooking
      </Button>
      {isCooking && (
        <CookingModeDisplay steps={steps} onClose={() => setIsCooking(false)} />
      )}
    </>
  );
}
