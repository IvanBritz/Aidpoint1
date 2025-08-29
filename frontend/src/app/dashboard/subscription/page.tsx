'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import DashboardLayout from '@/components/DashboardLayout';
import { planService, Plan } from '@/services/planService';
import { 
  Check, 
  Crown, 
  Star, 
  Zap, 
  Users, 
  UserCheck, 
  FileText, 
  BarChart3,
  Loader2,
  AlertCircle,
  CreditCard
} from 'lucide-react';

const getIconForFeature = (feature: string) => {
  const featureLower = feature.toLowerCase();
  
  if (featureLower.includes('beneficiar')) return Users;
  if (featureLower.includes('employee')) return UserCheck;
  if (featureLower.includes('report')) return FileText;
  if (featureLower.includes('analytic')) return BarChart3;
  if (featureLower.includes('support')) return UserCheck;
  if (featureLower.includes('api')) return Zap;
  if (featureLower.includes('custom')) return Star;
  if (featureLower.includes('unlimited')) return Crown;
  return Check;
};

const PlanCard = ({ plan, isPopular = false }: { plan: Plan; isPopular?: boolean }) => {
  return (
    <div className={`relative rounded-2xl border-2 p-8 ${
      isPopular 
        ? 'border-blue-500 bg-blue-50 shadow-xl ring-2 ring-blue-500 ring-opacity-50' 
        : 'border-gray-200 bg-white shadow-lg hover:border-gray-300 hover:shadow-xl'
    } transition-all duration-200`}>
      {isPopular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
            🌟 Most Popular
          </span>
        </div>
      )}
      
      <div className="text-center">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
        <p className="text-gray-600 mb-6">{plan.description}</p>
        
        <div className="mb-8">
          <span className="text-5xl font-bold text-gray-900">${plan.price}</span>
          <span className="text-gray-500 ml-2">/ month</span>
        </div>
        
        <button 
          className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200 ${
            isPopular
              ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl'
              : 'bg-gray-900 text-white hover:bg-gray-800 shadow-md hover:shadow-lg'
          }`}
        >
          Choose Plan
        </button>
      </div>
      
      <div className="mt-8 pt-8 border-t border-gray-200">
        <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
          <Star className="h-5 w-5 text-yellow-500 mr-2" />
          What's included:
        </h4>
        
        <div className="space-y-3">
          <div className="flex items-center text-sm text-gray-700">
            <Users className="h-4 w-4 text-blue-500 mr-3 flex-shrink-0" />
            <span>
              {plan.max_beneficiaries === 0 ? 'Unlimited' : `Up to ${plan.max_beneficiaries}`} beneficiaries
            </span>
          </div>
          <div className="flex items-center text-sm text-gray-700">
            <UserCheck className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
            <span>
              {plan.max_employees === 0 ? 'Unlimited' : `Up to ${plan.max_employees}`} employees
            </span>
          </div>
          
          {plan.features.map((feature, index) => {
            const IconComponent = getIconForFeature(feature);
            return (
              <div key={index} className="flex items-center text-sm text-gray-700">
                <IconComponent className="h-4 w-4 text-blue-500 mr-3 flex-shrink-0" />
                <span>{feature}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default function SubscriptionPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['plans'],
    queryFn: planService.getPlans,
  });

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading subscription plans...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to load plans</h3>
            <p className="text-gray-600">Please try refreshing the page.</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const plans = data?.plans || [];

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <CreditCard className="h-8 w-8 text-blue-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900">Choose Your Plan</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Select the perfect plan for your organization. Upgrade or downgrade at any time.
          </p>
        </div>

        {/* Billing Toggle (for future enhancement) */}
        <div className="flex justify-center mb-12">
          <div className="bg-gray-100 p-1 rounded-lg">
            <button className="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-md">
              Monthly
            </button>
            <button className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900">
              Annual (Save 20%)
            </button>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {plans.map((plan, index) => (
            <PlanCard 
              key={plan.id} 
              plan={plan} 
              isPopular={index === 1} // Make middle plan popular
            />
          ))}
        </div>

        {/* FAQ Section */}
        <div className="bg-gray-50 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Frequently Asked Questions
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Can I change my plan anytime?
              </h3>
              <p className="text-gray-600 text-sm">
                Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                What happens if I exceed my limits?
              </h3>
              <p className="text-gray-600 text-sm">
                We'll notify you when you're approaching your limits and help you upgrade to a suitable plan.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Is there a free trial?
              </h3>
              <p className="text-gray-600 text-sm">
                Yes! New accounts get a 30-day free trial with full access to all Basic Plan features.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Do you offer custom plans?
              </h3>
              <p className="text-gray-600 text-sm">
                For large organizations with specific needs, we offer custom enterprise solutions. Contact our sales team.
              </p>
            </div>
          </div>
        </div>

        {/* Contact Support */}
        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">
            Need help choosing the right plan?
          </p>
          <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
            Contact Sales
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
