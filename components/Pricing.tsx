
import React, { useState } from 'react';

interface PricingProps {
  currentPlan: string;
  onSelectPlan: (plan: 'Starter' | 'Creator Pro' | 'Agency') => void;
}

const Pricing: React.FC<PricingProps> = ({ currentPlan, onSelectPlan }) => {
  const [showSuccess, setShowSuccess] = useState(false);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annually'>('monthly');

  const handlePlanSelect = (plan: 'Starter' | 'Creator Pro' | 'Agency') => {
    if (plan === 'Agency') {
      alert("Please contact our enterprise sales team for the Agency plan: agency@thumbnailmaster.ai");
      return;
    }
    onSelectPlan(plan);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const calculatePrice = (monthlyPrice: number) => {
    if (monthlyPrice === 0) return '0';
    if (billingCycle === 'annually') {
      return (monthlyPrice * 0.88).toFixed(1);
    }
    return monthlyPrice.toString();
  };

  const plans = [
    {
      id: 'Starter',
      name: 'Starter',
      monthlyPrice: 0,
      desc: 'Perfect for hobbyist content creators.',
      features: ['5 Thumbnails per month', 'Standard SEO analysis', '1K Image Resolution', 'Community Support'],
      popular: false
    },
    {
      id: 'Creator Pro',
      name: 'Creator Pro',
      monthlyPrice: 19,
      desc: 'Grow your channel faster with pro tools.',
      features: ['Unlimited Thumbnails', 'Advanced SEO Grounding', '2K/4K Image Resolution', 'AI Image Editing Suite', 'Priority Processing'],
      popular: true
    },
    {
      id: 'Agency',
      name: 'Agency',
      monthlyPrice: 49,
      desc: 'Designed for high-volume content teams.',
      features: ['Multi-User Access', 'Custom AI Style Training', 'White-label Reporting', 'API Access (Coming Soon)', 'Account Manager'],
      popular: false
    }
  ];

  return (
    <div className="space-y-12 pb-20 relative">
      {showSuccess && (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top-10 duration-500">
           <div className="bg-green-600 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3">
             <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
               <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
             </div>
             <span className="font-bold">Plan Successfully Updated!</span>
           </div>
        </div>
      )}

      <header className="text-center space-y-6">
        <div className="space-y-2">
          <h2 className="text-4xl font-black text-gray-900 tracking-tight">Select Your Perfect Plan</h2>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">
            Transform your creative process. All the tools you need for YouTube success are right here.
          </p>
        </div>

        <div className="flex items-center justify-center gap-4 pt-4">
          <span className={`text-sm font-bold transition-colors ${billingCycle === 'monthly' ? 'text-gray-900' : 'text-gray-400'}`}>Monthly</span>
          <button 
            onClick={() => setBillingCycle(prev => prev === 'monthly' ? 'annually' : 'monthly')}
            className="w-14 h-7 bg-gray-200 rounded-full relative p-1 transition-colors hover:bg-gray-300"
          >
            <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-300 ${billingCycle === 'annually' ? 'translate-x-7 bg-red-600' : 'translate-x-0'}`}></div>
          </button>
          <div className="flex items-center gap-2">
            <span className={`text-sm font-bold transition-colors ${billingCycle === 'annually' ? 'text-gray-900' : 'text-gray-400'}`}>Annually</span>
            <span className="bg-green-100 text-green-700 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
              Save 12%
            </span>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch max-w-6xl mx-auto">
        {plans.map((plan) => {
          const isActive = currentPlan === plan.id;
          const price = calculatePrice(plan.monthlyPrice);
          const annualTotal = (plan.monthlyPrice * 12 * 0.88).toFixed(0);
          
          return (
            <div 
              key={plan.name} 
              className={`relative bg-white p-8 rounded-3xl border transition-all duration-500 flex flex-col ${
                plan.popular 
                ? 'border-red-500 shadow-xl shadow-red-100 md:scale-105 z-10' 
                : 'border-gray-100 shadow-sm'
              } ${isActive ? 'ring-4 ring-red-600/10 border-red-200' : ''}`}
            >
              {plan.popular && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-red-600 text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-lg">
                  Most Popular
                </div>
              )}
              
              <div className="mb-8">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                  {isActive && <span className="text-[10px] bg-green-100 text-green-600 px-2 py-0.5 rounded-full font-black uppercase">Active</span>}
                </div>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-gray-900 text-sm font-bold">$</span>
                  <span className="text-4xl font-black text-gray-900 tabular-nums transition-all">{price}</span>
                  <span className="text-gray-500 text-sm font-medium">/mo</span>
                </div>
                {billingCycle === 'annually' && plan.monthlyPrice > 0 ? (
                  <p className="text-[10px] font-bold text-green-600 uppercase tracking-tight">
                    Billed annually at ${annualTotal}/year
                  </p>
                ) : (
                  <p className="text-[10px] font-bold text-gray-300 uppercase tracking-tight">
                    Billed monthly
                  </p>
                )}
                <p className="text-sm text-gray-500 mt-4 leading-relaxed">{plan.desc}</p>
              </div>
              
              <div className="flex-1 space-y-4 mb-8">
                {plan.features.map(f => (
                  <div key={f} className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-red-50 text-red-600 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    </div>
                    <span className="text-sm text-gray-600 font-medium">{f}</span>
                  </div>
                ))}
              </div>

              <button 
                onClick={() => handlePlanSelect(plan.id as any)}
                disabled={isActive && plan.id !== 'Agency'}
                className={`w-full py-4 rounded-2xl font-bold transition-all duration-300 ${
                  isActive && plan.id !== 'Agency'
                  ? 'bg-gray-100 text-gray-400 cursor-default'
                  : plan.popular
                    ? 'bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-100'
                    : plan.id === 'Agency'
                      ? 'bg-black text-white hover:bg-gray-900'
                      : 'bg-gray-900 text-white hover:bg-black'
                }`}
              >
                {isActive && plan.id !== 'Agency' ? 'Current Plan' : plan.id === 'Agency' ? 'Contact Sales' : 'Get Started'}
              </button>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-3xl p-12 text-center max-w-4xl mx-auto border border-gray-100 shadow-sm">
         <h4 className="text-2xl font-black mb-10 text-gray-900">Frequently Asked Questions</h4>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10 text-left">
           <div>
             <p className="font-bold text-gray-900 mb-2">Can I cancel anytime?</p>
             <p className="text-gray-500 text-sm leading-relaxed">Yes, you can cancel your subscription at any time without commitment through your billing panel. You will keep access until the end of your period.</p>
           </div>
           <div>
             <p className="font-bold text-gray-900 mb-2">Who owns the copyright?</p>
             <p className="text-gray-500 text-sm leading-relaxed">You do. All images, texts, and voiceovers generated via Thumbnail Master are fully owned by you for commercial use.</p>
           </div>
           <div>
             <p className="font-bold text-gray-900 mb-2">How does annual billing work?</p>
             <p className="text-gray-500 text-sm leading-relaxed">When selecting the annual plan, you receive a 12% discount on the total 12-month amount, and the payment is collected as a one-time charge.</p>
           </div>
           <div>
             <p className="font-bold text-gray-900 mb-2">Can I upgrade later?</p>
             <p className="text-gray-500 text-sm leading-relaxed">Absolutely. You can switch to a higher plan at any time by just paying the prorated difference.</p>
           </div>
         </div>
      </div>
    </div>
  );
};

export default Pricing;
