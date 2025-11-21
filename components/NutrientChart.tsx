import React from 'react';
import { FoodAnalysisResult } from '../types';
import { ProgressBar } from './ProgressBar';

interface NutrientChartProps {
  data: FoodAnalysisResult;
}

export const NutrientChart: React.FC<NutrientChartProps> = ({ data }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Macros Section */}
      <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 backdrop-blur-sm">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
          </svg>
          Macros Breakdown
        </h3>
        
        <ProgressBar 
          label="Protein" 
          value={data.macros.protein.amount} 
          unit="g" 
          max={50} // Arbitrary max for visualization scale
          colorClass="bg-blue-500"
          delay={100}
        />
        <ProgressBar 
          label="Carbohydrates" 
          value={data.macros.carbs.amount} 
          unit="g" 
          max={100} 
          colorClass="bg-amber-500"
          delay={200}
        />
        <ProgressBar 
          label="Fats" 
          value={data.macros.fat.amount} 
          unit="g" 
          max={40} 
          colorClass="bg-rose-500"
          delay={300}
        />
      </div>

      {/* Vitamins Section */}
      <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 backdrop-blur-sm">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
          Micronutrients & Minerals
        </h3>
        
        <div className="space-y-4">
          {data.vitamins.map((vit, index) => (
             <div key={vit.name} className="flex items-center gap-3">
               <div className="w-24 text-sm text-slate-300 font-medium">{vit.name}</div>
               <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                 <div 
                    className="h-full bg-brand-400 rounded-full opacity-0 animate-pulse-slow"
                    style={{ 
                      width: `${Math.min(vit.level, 100)}%`, 
                      animation: `fillIn 1s ease-out forwards ${index * 100 + 400}ms` 
                    }}
                 />
                 <style>{`
                    @keyframes fillIn {
                      from { width: 0; opacity: 1; }
                      to { width: ${Math.min(vit.level, 100)}%; opacity: 1; }
                    }
                 `}</style>
               </div>
               <div className="w-12 text-right text-xs text-slate-400">{vit.level}%</div>
             </div>
          ))}
        </div>
        
        <div className="mt-6 pt-4 border-t border-slate-700">
             <div className="flex justify-between items-center">
                <span className="text-slate-400 text-sm">Health Score</span>
                <span className={`text-xl font-bold ${data.healthScore >= 7 ? 'text-brand-400' : data.healthScore >= 4 ? 'text-amber-400' : 'text-red-400'}`}>
                    {data.healthScore}/10
                </span>
             </div>
        </div>
      </div>
    </div>
  );
};