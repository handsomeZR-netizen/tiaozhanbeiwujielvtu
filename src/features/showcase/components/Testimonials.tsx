import React from 'react';
import { motion } from 'framer-motion';
import { Star, Quote, MapPin } from 'lucide-react';

const reviews = [
  {
    id: 1,
    name: "Sarah Jenkins",
    role: "Travel Vlogger",
    location: "California, USA",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=faces",
    content: "TrueView China completely changed my perspective on Huizhou architecture. The AI stories made the ancient walls feel alive!",
    rating: 5
  },
  {
    id: 2,
    name: "Hiroshi Tanaka",
    role: "Architecture Student",
    location: "Tokyo, Japan",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=faces",
    content: "The depth of cultural translation is amazing. It explained the 'Ma Tou Qiang' concept in a way that resonated with my own studies.",
    rating: 5
  },
  {
    id: 3,
    name: "Elena Rossi",
    role: "Backpacker",
    location: "Florence, Italy",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=faces",
    content: "I was afraid of the language barrier, but the 'Boundless' app made me feel like a local. The itinerary planner is a lifesaver.",
    rating: 4
  },
  {
    id: 4,
    name: "Liam O'Connor",
    role: "History Teacher",
    location: "Dublin, Ireland",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=faces",
    content: "A masterpiece of digital storytelling. It's not just a map; it's a bridge between civilizations.",
    rating: 5
  },
  {
    id: 5,
    name: "Chen Wei",
    role: "Host",
    location: "Nanjing, China",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=faces",
    content: "Helping foreign guests understand our culture has never been easier. This tool is the perfect conversation starter.",
    rating: 5
  }
];

// Duplicate list for seamless loop
const allReviews = [...reviews, ...reviews];

export const Testimonials: React.FC = () => {
  return (
    <div className="py-24 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 mb-16 text-center">
        <h2 className="text-3xl md:text-4xl font-serif font-bold text-ink-900 mb-4">
          全球青年的<span className="text-indigo-600">共鸣回响</span>
        </h2>
        <p className="text-ink-500 font-light">连接不同文化背景的真实体验反馈</p>
      </div>

      {/* Gradient Masks */}
      <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none"></div>
      <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none"></div>

      {/* Marquee Container */}
      <div className="flex overflow-hidden relative w-full">
        <motion.div 
          className="flex gap-8 px-4"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ 
            duration: 40, 
            ease: "linear", 
            repeat: Infinity 
          }}
          style={{ width: "fit-content" }}
        >
          {allReviews.map((review, index) => (
            <div 
              key={`${review.id}-${index}`}
              className="w-[350px] flex-shrink-0 p-6 bg-slate-50 border border-slate-100 rounded-2xl hover:shadow-lg hover:bg-white hover:-translate-y-1 transition-all duration-300 group"
            >
              <div className="flex items-start justify-between mb-4">
                 <div className="flex items-center gap-3">
                   <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-sm">
                     <img src={review.avatar} alt={review.name} className="w-full h-full object-cover" />
                   </div>
                   <div>
                     <h4 className="font-bold text-ink-900 text-sm">{review.name}</h4>
                     <div className="text-xs text-ink-400 flex items-center gap-1">
                       <MapPin size={10} /> {review.location}
                     </div>
                   </div>
                 </div>
                 <div className="text-indigo-100 group-hover:text-indigo-50 transition-colors">
                   <Quote size={24} fill="currentColor" />
                 </div>
              </div>
              
              <p className="text-ink-600 text-sm leading-relaxed mb-4 italic font-serif">
                "{review.content}"
              </p>

              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    size={14} 
                    className={i < review.rating ? "text-amber-400 fill-amber-400" : "text-slate-200"} 
                  />
                ))}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};