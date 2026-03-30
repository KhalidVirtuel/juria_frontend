import { motion } from 'framer-motion';

interface Testimonial {
  text: string;
  image: string;
  name: string;
  role: string;
}

interface TestimonialsColumnProps {
  testimonials: Testimonial[];
  duration: number;
  className?: string;
}

export const TestimonialsColumn = ({ testimonials, duration, className = '' }: TestimonialsColumnProps) => {
  return (
    <motion.div
      animate={{
        translateY: "-50%"
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: "linear",
        repeatType: "loop"
      }}
      className={`space-y-6 pb-6 ${className}`}
    >
      {/* Duplicate testimonials twice for infinite loop */}
      {[...testimonials, ...testimonials].map((testimonial, index) => (
        <div
          key={index}
          className="p-10 rounded-3xl border shadow-lg shadow-primary/10 max-w-xs w-full bg-card"
        >
          <p className="text-foreground mb-5 leading-relaxed">
            "{testimonial.text}"
          </p>
          <div className="flex items-center gap-3 mt-5">
            <img
              src={testimonial.image}
              alt={testimonial.name}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div>
              <p className="font-medium tracking-tight leading-5 text-foreground">
                {testimonial.name}
              </p>
              <p className="opacity-60 leading-5 tracking-tight text-sm text-muted-foreground">
                {testimonial.role}
              </p>
            </div>
          </div>
        </div>
      ))}
    </motion.div>
  );
};
