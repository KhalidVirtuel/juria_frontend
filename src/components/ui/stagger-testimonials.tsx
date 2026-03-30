"use client"

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const SQRT_5000 = Math.sqrt(5000);

const testimonials = [
  {
    tempId: 0,
    testimonial: "Mizen AI a transformé notre cabinet. Nous gagnons 15 heures par semaine sur les tâches répétitives.",
    by: "Maître Karim Benjelloun, Avocat d'affaires",
    imgSrc: "https://i.pravatar.cc/150?img=1"
  },
  {
    tempId: 1,
    testimonial: "L'analyse de documents est d'une précision remarquable. Un vrai gain de temps pour nos dossiers complexes.",
    by: "Maître Fatima El Amrani, Avocate au barreau de Casablanca",
    imgSrc: "https://i.pravatar.cc/150?img=2"
  },
  {
    tempId: 2,
    testimonial: "La recherche juridique n'a jamais été aussi rapide. Mizen AI trouve les jurisprudences en quelques secondes.",
    by: "Maître Hassan Alaoui, Associé chez Alaoui & Partners",
    imgSrc: "https://i.pravatar.cc/150?img=3"
  },
  {
    tempId: 3,
    testimonial: "Un outil indispensable pour notre cabinet. La rédaction de contrats est devenue beaucoup plus efficace.",
    by: "Maître Amina Tazi, Avocate spécialisée en droit commercial",
    imgSrc: "https://i.pravatar.cc/150?img=4"
  },
  {
    tempId: 4,
    testimonial: "Interface intuitive et résultats précis. Exactement ce dont nous avions besoin.",
    by: "Maître Youssef Benani, Directeur juridique",
    imgSrc: "https://i.pravatar.cc/150?img=5"
  },
  {
    tempId: 5,
    testimonial: "Nos clients apprécient la rapidité de nos réponses grâce à Mizen AI. Un vrai plus pour notre cabinet.",
    by: "Maître Leila Mansouri, Avocate en droit de la famille",
    imgSrc: "https://i.pravatar.cc/150?img=6"
  },
  {
    tempId: 6,
    testimonial: "La base de données juridique est impressionnante. Tout ce dont nous avons besoin est accessible en un clic.",
    by: "Maître Omar Fassi, Avocat au barreau de Rabat",
    imgSrc: "https://i.pravatar.cc/150?img=7"
  },
  {
    tempId: 7,
    testimonial: "Un investissement rentable dès le premier mois. Le ROI est exceptionnel pour notre cabinet.",
    by: "Maître Sanaa Idrissi, Associée fondatrice",
    imgSrc: "https://i.pravatar.cc/150?img=8"
  },
  {
    tempId: 8,
    testimonial: "L'assistant IA comprend parfaitement nos besoins juridiques. C'est bluffant de précision.",
    by: "Maître Rachid Moussaoui, Avocat fiscaliste",
    imgSrc: "https://i.pravatar.cc/150?img=9"
  },
  {
    tempId: 9,
    testimonial: "Nous avons essayé plusieurs solutions, mais Mizen AI est la seule vraiment adaptée aux avocats marocains.",
    by: "Maître Nadia Chraibi, Avocate au barreau de Marrakech",
    imgSrc: "https://i.pravatar.cc/150?img=10"
  },
  {
    tempId: 10,
    testimonial: "Formation rapide, prise en main immédiate. Toute l'équipe est opérationnelle en quelques jours.",
    by: "Maître Ahmed Bennani, Responsable formation",
    imgSrc: "https://i.pravatar.cc/150?img=11"
  },
  {
    tempId: 11,
    testimonial: "Le support client est réactif et compétent. Ils comprennent nos enjeux juridiques.",
    by: "Maître Zineb Lahlou, Avocate en droit social",
    imgSrc: "https://i.pravatar.cc/150?img=12"
  }
];

interface TestimonialCardProps {
  position: number;
  testimonial: typeof testimonials[0];
  handleMove: (steps: number) => void;
  cardSize: number;
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({ 
  position, 
  testimonial, 
  handleMove, 
  cardSize 
}) => {
  const isCenter = position === 0;

  return (
    <div
      onClick={() => handleMove(position)}
      className={cn(
        "absolute left-1/2 top-1/2 cursor-pointer border-2 p-8 transition-all duration-500 ease-in-out",
        isCenter 
          ? "z-10 bg-primary text-primary-foreground border-primary" 
          : "z-0 bg-card text-card-foreground border-border hover:border-primary/50"
      )}
      style={{
        width: cardSize,
        height: cardSize,
        clipPath: `polygon(50px 0%, calc(100% - 50px) 0%, 100% 50px, 100% 100%, calc(100% - 50px) 100%, 50px 100%, 0 100%, 0 0)`,
        transform: `
          translate(-50%, -50%) 
          translateX(${(cardSize / 1.5) * position}px)
          translateY(${isCenter ? -65 : position % 2 ? 15 : -15}px)
          rotate(${isCenter ? 0 : position % 2 ? 2.5 : -2.5}deg)
        `,
        boxShadow: isCenter ? "0px 8px 0px 4px hsl(var(--border))" : "0px 0px 0px 0px transparent"
      }}
    >
      <span
        className="absolute block origin-top-right rotate-45 bg-border"
        style={{
          right: -2,
          top: 48,
          width: SQRT_5000,
          height: 2
        }}
      />
      <img
        src={testimonial.imgSrc}
        alt={`${testimonial.by.split(',')[0]}`}
        className="mb-4 h-14 w-12 bg-muted object-cover object-top"
        style={{
          boxShadow: "3px 3px 0px hsl(var(--background))"
        }}
      />
      <h3 className={cn(
        "text-base sm:text-xl font-medium",
        isCenter ? "text-primary-foreground" : "text-foreground"
      )}>
        "{testimonial.testimonial}"
      </h3>
      <p className={cn(
        "absolute bottom-8 left-8 right-8 mt-2 text-sm italic",
        isCenter ? "text-primary-foreground/80" : "text-muted-foreground"
      )}>
        - {testimonial.by}
      </p>
    </div>
  );
};

export const StaggerTestimonials: React.FC = () => {
  const [cardSize, setCardSize] = useState(365);
  const [testimonialsList, setTestimonialsList] = useState(testimonials);

  const handleMove = (steps: number) => {
    const newList = [...testimonialsList];
    if (steps > 0) {
      for (let i = steps; i > 0; i--) {
        const item = newList.shift();
        if (!item) return;
        newList.push({ ...item, tempId: Math.random() });
      }
    } else {
      for (let i = steps; i < 0; i++) {
        const item = newList.pop();
        if (!item) return;
        newList.unshift({ ...item, tempId: Math.random() });
      }
    }
    setTestimonialsList(newList);
  };

  useEffect(() => {
    const updateSize = () => {
      const { matches } = window.matchMedia("(min-width: 640px)");
      setCardSize(matches ? 365 : 290);
    };

    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  return (
    <div
      className="relative w-full overflow-hidden bg-background"
      style={{ height: 600 }}
    >
      {testimonialsList.map((testimonial, index) => {
        const position = testimonialsList.length % 2
          ? index - (testimonialsList.length + 1) / 2
          : index - testimonialsList.length / 2;
        return (
          <TestimonialCard
            key={testimonial.tempId}
            testimonial={testimonial}
            handleMove={handleMove}
            position={position}
            cardSize={cardSize}
          />
        );
      })}
      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
        <button
          onClick={() => handleMove(-1)}
          className={cn(
            "flex h-14 w-14 items-center justify-center text-2xl transition-colors",
            "bg-background border-2 border-border hover:bg-accent hover:text-accent-foreground",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          )}
          aria-label="Previous testimonial"
        >
          <ChevronLeft />
        </button>
        <button
          onClick={() => handleMove(1)}
          className={cn(
            "flex h-14 w-14 items-center justify-center text-2xl transition-colors",
            "bg-background border-2 border-border hover:bg-accent hover:text-accent-foreground",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          )}
          aria-label="Next testimonial"
        >
          <ChevronRight />
        </button>
      </div>
    </div>
  );
};
