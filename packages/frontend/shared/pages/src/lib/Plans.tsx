import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Check, ChevronLeft, CheckCircle2 } from 'lucide-react';
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from '@spark-nest-ed/frontend-shared-components';
import { Button, useToast } from '@spark-nest-ed/frontend-shared-components';
import { ROUTES } from '@spark-nest-ed/frontend-core-constants';
import { useAuth } from '@spark-nest-ed/frontend-core-auth';

const PlansSelectionPage = () => {
  const { login } = useAuth();
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId);
  };

  const handleContinue = () => {
    if (!selectedPlan) {
      toast({
        title: 'Please select a plan',
        description: 'You need to select a plan to continue',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Plan selected!',
      description: 'Proceeding to account setup',
    });

    login();
  };

  const planFeatures = {
    free: [
      'Access to limited lessons',
      'Basic progress tracking',
      'Community forum access',
    ],
    basic: [
      'Access to all lessons',
      'Progress tracking',
      'Mobile app access',
      'Community forum access',
    ],
    premium: [
      'Everything in Basic',
      'Personalized study plan',
      'Weekly live group sessions',
      'Direct message support',
      'Downloadable resources',
    ],
    pro: [
      'Everything in Premium',
      '1-on-1 tutoring (4 sessions/month)',
      'Priority support',
      'Advanced pronunciation feedback',
      'Custom lesson creation',
      'Certificate upon completion',
    ],
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border py-4">
        <div className="container max-w-7xl mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/')}
              className="mr-2"
            >
              <ChevronLeft className="h-5 w-5" />
              <span className="sr-only">Back to home</span>
            </Button>
            <Link to={ROUTES.HOME} className="flex items-center space-x-1">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <span className="text-base font-semibold text-primary-foreground">
                  E
                </span>
              </span>
              <span className="text-lg font-semibold text-foreground">
                EnglishSelf
              </span>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 container max-w-14xl mx-auto px-4 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold mb-3">Choose Your Plan</h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Select the plan that best fits your learning needs. All plans
              include a 7-day free trial.
            </p>
          </div>

          {/* Billing Cycle Selector */}
          <div className="mb-12">
            <Tabs
              defaultValue="monthly"
              value={billingCycle}
              onValueChange={setBillingCycle}
              className="w-full max-w-md mx-auto"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="monthly">Monthly</TabsTrigger>
                <TabsTrigger value="annual">
                  Annual
                  <span className="ml-2 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 text-xs px-2 py-0.5 rounded-full">
                    Save 20%
                  </span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Plans */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Free Plan */}
            <div
              onClick={() => handlePlanSelect('free')}
              className={`rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden transition-all cursor-pointer hover:border-primary/50 hover:shadow-md ${
                selectedPlan === 'free' ? 'ring-2 ring-primary' : ''
              } w-full h-full flex flex-col justify-between`}
            >
              <div className="p-6 flex-grow">
                <h3 className="text-xl font-semibold mb-1">Free</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  For beginners
                </p>

                <div className="flex items-baseline mb-6">
                  <span className="text-3xl font-bold">$0</span>
                  <span className="text-muted-foreground ml-1 text-sm">
                    /month
                  </span>
                </div>

                <ul className="space-y-3 mb-6">
                  {planFeatures.free.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className=" p-4">
                <div
                  className={`h-10 flex items-center justify-center rounded-md w-full border ${
                    selectedPlan === 'free'
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'border-input bg-background text-foreground'
                  }`}
                >
                  {selectedPlan === 'free' ? (
                    <div className="flex items-center">
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Selected
                    </div>
                  ) : (
                    'Select Plan'
                  )}
                </div>
              </div>
            </div>

            {/* Basic Plan */}
            <div
              onClick={() => handlePlanSelect('basic')}
              className={`rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden transition-all cursor-pointer hover:border-primary/50 hover:shadow-md ${
                selectedPlan === 'basic' ? 'ring-2 ring-primary' : ''
              } w-full h-full flex flex-col justify-between`}
            >
              <div className="p-6 flex-grow">
                <h3 className="text-xl font-semibold mb-1">Basic</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  For casual learners
                </p>

                <div className="flex items-baseline mb-6">
                  <span className="text-3xl font-bold">
                    {billingCycle === 'monthly' ? '$9.99' : '$7.99'}
                  </span>
                  <span className="text-muted-foreground ml-1 text-sm">
                    /
                    {billingCycle === 'monthly'
                      ? 'month'
                      : 'month, billed annually'}
                  </span>
                </div>

                <ul className="space-y-3 mb-6">
                  {planFeatures.basic.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="p-4">
                <div
                  className={`h-10 flex items-center justify-center rounded-md w-full border ${
                    selectedPlan === 'basic'
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'border-input bg-background text-foreground'
                  }`}
                >
                  {selectedPlan === 'basic' ? (
                    <div className="flex items-center">
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Selected
                    </div>
                  ) : (
                    'Select Plan'
                  )}
                </div>
              </div>
            </div>

            {/* Premium Plan */}
            <div
              onClick={() => handlePlanSelect('premium')}
              className={`rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden transition-all cursor-pointer hover:border-primary/50 hover:shadow-md relative ${
                selectedPlan === 'premium' ? 'ring-2 ring-primary' : ''
              } w-full h-full flex flex-col justify-between`}
            >
              <div className="p-6  flex-grow ">
                <div className="absolute top-0 right-0 left-0 bg-blue-500 text-white py-1 px-3 text-xs font-medium text-center">
                  MOST POPULAR
                </div>
                <h3 className="text-xl font-semibold mb-1 mt-1">Premium</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  For dedicated learners
                </p>

                <div className="flex items-baseline mb-6">
                  <span className="text-3xl font-bold">
                    {billingCycle === 'monthly' ? '$19.99' : '$15.99'}
                  </span>
                  <span className="text-muted-foreground ml-1 text-sm">
                    /
                    {billingCycle === 'monthly'
                      ? 'month'
                      : 'month, billed annually'}
                  </span>
                </div>

                <ul className="space-y-3 mb-6">
                  {planFeatures.premium.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4">
                <div
                  className={`h-10 flex items-center justify-center rounded-md w-full border ${
                    selectedPlan === 'premium'
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'border-input bg-background text-foreground'
                  }`}
                >
                  {selectedPlan === 'premium' ? (
                    <div className="flex items-center">
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Selected
                    </div>
                  ) : (
                    'Select Plan'
                  )}
                </div>
              </div>
            </div>

            {/* Pro Plan */}
            <div
              onClick={() => handlePlanSelect('pro')}
              className={`rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden transition-all cursor-pointer hover:border-primary/50 hover:shadow-md ${
                selectedPlan === 'pro' ? 'ring-2 ring-primary' : ''
              }`}
            >
              <div className="p-6 flex-grow">
                <h3 className="text-xl font-semibold mb-1">Pro</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  For serious learners
                </p>

                <div className="flex items-baseline mb-6">
                  <span className="text-3xl font-bold">
                    {billingCycle === 'monthly' ? '$39.99' : '$31.99'}
                  </span>
                  <span className="text-muted-foreground ml-1 text-sm">
                    /
                    {billingCycle === 'monthly'
                      ? 'month'
                      : 'month, billed annually'}
                  </span>
                </div>

                <ul className="space-y-3 mb-6">
                  {planFeatures.pro.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4">
                <div
                  className={`h-10 flex items-center justify-center rounded-md w-full border ${
                    selectedPlan === 'pro'
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'border-input bg-background text-foreground'
                  }`}
                >
                  {selectedPlan === 'pro' ? (
                    <div className="flex items-center">
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Selected
                    </div>
                  ) : (
                    'Select Plan'
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 text-center">
            <Button size="lg" onClick={handleContinue} disabled={!selectedPlan}>
              Continue
            </Button>

            <p className="mt-4 text-sm text-muted-foreground">
              All plans come with a 7-day free trial. No credit card required to
              start.
            </p>
          </div>
        </div>
      </main>

      <footer className="py-4 border-t border-border">
        <div className="container max-w-7xl mx-auto px-4">
          <p className="text-sm text-center text-muted-foreground">
            &copy; {new Date().getFullYear()} EnglishSelf. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default PlansSelectionPage;
