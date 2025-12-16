import React from 'react';
import { Subscription, SubscriptionStatus } from '../types';
import { STATUS_COLORS } from '../constants';
import { AlertTriangle, CheckCircle2, Clock, XCircle, User, Key, Users } from 'lucide-react';

interface Props {
  data: Subscription;
  index: number;
}

const StatusIcon = ({ status }: { status: SubscriptionStatus }) => {
  switch (status) {
    case SubscriptionStatus.EXPIRED: return <XCircle className="w-5 h-5" />;
    case SubscriptionStatus.EXPIRING_SOON: return <AlertTriangle className="w-5 h-5" />;
    case SubscriptionStatus.UPCOMING: return <Clock className="w-5 h-5" />;
    case SubscriptionStatus.SAFE: return <CheckCircle2 className="w-5 h-5" />;
  }
};

export const SubscriptionCard: React.FC<Props> = ({ data, index }) => {
  const colorClass = STATUS_COLORS[data.status];
  
  return (
    <div 
      className={`relative group overflow-hidden rounded-xl border border-white/10 bg-gray-900/40 backdrop-blur-md p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-white/20`}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Decorative Glow Line */}
      <div className={`absolute top-0 left-0 w-1 h-full ${colorClass.split(' ')[2].replace('shadow', 'bg').replace('/50', '')}`} />
      
      <div className="flex justify-between items-start mb-4">
        <div className="w-full pr-2">
          <div className="flex items-center gap-2 mb-1">
             <User className="w-4 h-4 text-cyan-400" />
             <h3 className="font-display font-bold text-lg text-white truncate w-full" title={data.username}>
               {data.username}
             </h3>
          </div>
          <p className="text-gray-400 text-sm font-mono flex items-center gap-2">
             <span className="text-gray-600">SCAD:</span> {data.date.toLocaleDateString('it-IT')}
          </p>
        </div>
        <div className={`p-2 rounded-lg border ${colorClass} flex items-center justify-center shrink-0`}>
          <StatusIcon status={data.status} />
        </div>
      </div>

      <div className="space-y-2 border-t border-white/5 pt-3">
        {data.password && (
            <div className="flex items-center justify-between text-sm font-mono bg-black/20 p-2 rounded">
                <div className="flex items-center gap-2 text-gray-400">
                    <Key className="w-3 h-3" /> PASS
                </div>
                <span className="text-cyan-200 select-all">{data.password}</span>
            </div>
        )}
        
        {data.reference && (
            <div className="flex items-center justify-between text-sm font-mono bg-black/20 p-2 rounded">
                <div className="flex items-center gap-2 text-gray-400">
                    <Users className="w-3 h-3" /> REF
                </div>
                <span className="text-purple-300 truncate max-w-[120px]" title={data.reference}>{data.reference}</span>
            </div>
        )}
      </div>

      <div className="flex justify-between items-end mt-4 pt-2 border-t border-white/5">
        <div className="text-left w-full">
          <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded bg-black/30 border border-white/10 ${colorClass.split(' ')[0]}`}>
            {data.status}
          </span>
          <p className={`text-xs mt-1 font-bold text-right float-right ${data.daysRemaining < 0 ? 'text-red-400' : 'text-gray-400'}`}>
            {data.daysRemaining < 0 
              ? `${Math.abs(data.daysRemaining)} GG FA` 
              : `TRA ${data.daysRemaining} GG`}
          </p>
        </div>
      </div>
      
      {/* Hover Light Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-[shine_1s_ease-in-out]" />
    </div>
  );
};