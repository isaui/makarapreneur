"use client";

import { useState, FormEvent, ChangeEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, UserCircle2, Users, FileText, ChevronRight, ChevronLeft, Check, Image } from 'lucide-react';
import { semifinalTeamService } from '@/lib/firebase/semifinalTeamService';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from '@/contexts/AuthContext';
import { Progress } from '@/components/ui/progress';
import { Competition } from '@/models/Competition';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface RegisterSemifinalProps {
  competition: Competition;
}

interface FormData {
  teamName: string;
  
  // Team Leader fields
  leaderName: string;
  leaderEmail: string;
  
  // Member 1 fields
  member1Name: string;
  member1Email: string;
  
  // Member 2 fields
  member2Name: string;
  member2Email: string;
  
  // Registration file (Image or PDF)
  registrationFile: File | null;
}

interface FormErrors {
  [key: string]: string;
}

interface StepProps {
  title: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: any;
  isCompleted: boolean;
  isActive: boolean;
}

const Step = ({ title, icon, isCompleted, isActive }: StepProps) => (
    <div className={`flex items-center space-x-2 ${isActive ? 'text-juneBud' : 'text-gray-400'}`}>
      <div className={`p-2 rounded-full ${
        isCompleted 
          ? 'bg-juneBud' 
          : isActive 
            ? 'bg-juneBud/80' 
            : 'bg-gray-700'
      } text-signalBlack`}>
        {isCompleted ? <Check className="w-5 h-5" /> : icon}
      </div>
      <span className={`text-sm font-medium ${isActive ? 'text-juneBud' : 'text-gray-400'}`}>{title}</span>
    </div>
  );

export default function RegisterSemifinal({ competition }: RegisterSemifinalProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { user, loading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    teamName: '',
    
    leaderName: '',
    leaderEmail: '',
    
    member1Name: '',
    member1Email: '',
    
    member2Name: '',
    member2Email: '',
    
    registrationFile: null
  });
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (loading) return;
    
    if (!user) {
      router.push('/authentication/login');
      return;
    }
  }, [user, loading, router]);

  const validateEmail = (email: string) => {
    return /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email);
  };

  const validateStep = (step: number) => {
    const newErrors: FormErrors = {};

    if (step === 1) {
      if (!formData.teamName) newErrors.teamName = 'Team name is required';
      if (!formData.leaderName) newErrors.leaderName = 'Leader name is required';
      if (!formData.leaderEmail) {
        newErrors.leaderEmail = 'Leader email is required';
      } else if (!validateEmail(formData.leaderEmail)) {
        newErrors.leaderEmail = 'Invalid email address';
      }
    }

    if (step === 2) {
      if (!formData.member1Name) newErrors.member1Name = 'Member 1 name is required';
      if (!formData.member1Email) {
        newErrors.member1Email = 'Member 1 email is required';
      } else if (!validateEmail(formData.member1Email)) {
        newErrors.member1Email = 'Invalid email address';
      }
      
      // Member 2 validation only if any field is filled
      const hasMember2Info = formData.member2Name || formData.member2Email;
      
      if (hasMember2Info) {
        if (!formData.member2Name) newErrors.member2Name = 'Member 2 name is required';
        if (!formData.member2Email) {
          newErrors.member2Email = 'Member 2 email is required';
        } else if (!validateEmail(formData.member2Email)) {
          newErrors.member2Email = 'Invalid email address';
        }
      }
    }

    if (step === 3) {
      if (!formData.registrationFile) {
        newErrors.registrationFile = 'Registration file is required';
      } else {
        // Validate file type (must be image or PDF)
        const validFileTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
        if (!validFileTypes.includes(formData.registrationFile.type)) {
          newErrors.registrationFile = 'Registration file must be an image (JPEG, PNG) or PDF file';
        }
        
        // Validate file size (max 5MB)
        const maxSizeInBytes = 5 * 1024 * 1024; // 5MB
        if (formData.registrationFile.size > maxSizeInBytes) {
          newErrors.registrationFile = 'Registration file must be less than 5MB';
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData(prev => ({
      ...prev,
      registrationFile: file
    }));
    
    if (errors.registrationFile) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.registrationFile;
        return newErrors;
      });
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 3));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!validateStep(currentStep)) {
      return;
    }

    try {
      setIsSubmitting(true);

      if (!user) {
        throw new Error('You must be logged in to register');
      }

      // Create team data structure that matches the simplified Team model
      const teamData = {
        teamName: formData.teamName,
        teamLeader: {
          name: formData.leaderName,
          email: formData.leaderEmail
        },
        members: {
          member1: {
            name: formData.member1Name,
            email: formData.member1Email
          },
          member2: formData.member2Name ? {
            name: formData.member2Name,
            email: formData.member2Email
          } : undefined
        },
        registrationDate: new Date()
      };

      if (!formData.registrationFile) {
        throw new Error('Registration file is required');
      }

      await semifinalTeamService.registerSemifinalTeam(
        user.uid,
        competition.id,
        teamData,
        formData.registrationFile
      );

      toast({
        title: "Semifinal Registration Successful",
        description: "Your team has been registered for the semifinal. Please wait for admin approval.",
      });

      router.push('/competition/' + competition.id);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Registration Failed",
        description: error instanceof Error ? error.message : "Failed to register semifinal team",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-signalBlack flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-juneBud" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-signalBlack font-poppins text-linen">
      <Navbar notTransparent/>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-juneBud to-juneBud/90 text-signalBlack mt-24">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="max-w-3xl">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">{competition.name} Semifinal</h1>
            <p className="text-xl text-signalBlack/80 leading-relaxed">
              {competition.description || 'Register for the semifinals and continue your journey!'}
            </p>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-gradient-to-r from-black/50 to-black/30 backdrop-blur-sm border-y border-white/10">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <Progress 
            value={(currentStep / 3) * 100} 
            className="mb-6 bg-white/10" 
          />
          <div className="flex justify-between">
            <Step 
              title="Team Leader Info"
              icon={<UserCircle2 className="w-5 h-5" />}
              isCompleted={currentStep > 1}
              isActive={currentStep === 1}
            />
            <Step 
              title="Team Members"
              icon={<Users className="w-5 h-5" />}
              isCompleted={currentStep > 2}
              isActive={currentStep === 2}
            />
            <Step 
              title="Documentation"
              icon={<FileText className="w-5 h-5" />}
              isCompleted={currentStep > 3}
              isActive={currentStep === 3}
            />
          </div>
        </div>
      </div>

      {/* Form Section */}
      <div className="max-w-3xl mx-auto px-4 py-12">
        <form onSubmit={onSubmit} className="bg-zinc-900/50 backdrop-blur-sm rounded-xl shadow-2xl p-8 border border-white/10">
          {/* Step 1: Team and Leader Information */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-6 text-juneBud">Team Information</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Team Name</label>
                    <Input
                      name="teamName"
                      value={formData.teamName}
                      onChange={handleInputChange}
                      placeholder="Enter your team name"
                      className="bg-black/50 border-gray-700 focus:border-juneBud focus:ring-juneBud/20 text-linen placeholder:text-gray-500"
                    />
                    {errors.teamName && (
                      <p className="text-red-400 text-sm mt-1">{errors.teamName}</p>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-6 text-juneBud">Team Leader Details</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Full Name</label>
                    <Input
                      name="leaderName"
                      value={formData.leaderName}
                      onChange={handleInputChange}
                      placeholder="Enter team leader's full name"
                      className="bg-black/50 border-gray-700 focus:border-juneBud focus:ring-juneBud/20 text-linen placeholder:text-gray-500"
                    />
                    {errors.leaderName && (
                      <p className="text-red-400 text-sm mt-1">{errors.leaderName}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Email Address</label>
                    <Input
                      name="leaderEmail"
                      value={formData.leaderEmail}
                      onChange={handleInputChange}
                      type="email"
                      placeholder="Enter team leader's email"
                      className="bg-black/50 border-gray-700 focus:border-juneBud focus:ring-juneBud/20 text-linen placeholder:text-gray-500"
                    />
                    {errors.leaderEmail && (
                      <p className="text-red-400 text-sm mt-1">{errors.leaderEmail}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Team Members Information */}
          {currentStep === 2 && (
            <div className="space-y-8">
              <div>
                <h2 className="text-xl font-semibold mb-6 text-juneBud">Team Member 1</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Full Name</label>
                    <Input
                      name="member1Name"
                      value={formData.member1Name}
                      onChange={handleInputChange}
                      placeholder="Enter member 1's full name"
                      className="bg-black/50 border-gray-700 focus:border-juneBud focus:ring-juneBud/20 text-linen placeholder:text-gray-500"
                    />
                    {errors.member1Name && (
                      <p className="text-red-400 text-sm mt-1">{errors.member1Name}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Email Address</label>
                    <Input
                      name="member1Email"
                      value={formData.member1Email}
                      onChange={handleInputChange}
                      type="email"
                      placeholder="Enter member 1's email"
                      className="bg-black/50 border-gray-700 focus:border-juneBud focus:ring-juneBud/20 text-linen placeholder:text-gray-500"
                    />
                    {errors.member1Email && (
                     <p className="text-red-400 text-sm mt-1">{errors.member1Email}</p>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-6 text-juneBud flex items-center">
                  Team Member 2
                  <span className="text-sm font-normal text-gray-400 ml-2">(Optional)</span>
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Full Name</label>
                    <Input
                      name="member2Name"
                      value={formData.member2Name}
                      onChange={handleInputChange}
                      placeholder="Enter member 2's full name (optional)"
                      className="bg-black/50 border-gray-700 focus:border-juneBud focus:ring-juneBud/20 text-linen placeholder:text-gray-500"
                    />
                    {errors.member2Name && (
                      <p className="text-red-400 text-sm mt-1">{errors.member2Name}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Email Address</label>
                    <Input
                      name="member2Email"
                      value={formData.member2Email}
                      onChange={handleInputChange}
                      type="email"
                      placeholder="Enter member 2's email (optional)"
                      className="bg-black/50 border-gray-700 focus:border-juneBud focus:ring-juneBud/20 text-linen placeholder:text-gray-500"
                    />
                    {errors.member2Email && (
                      <p className="text-red-400 text-sm mt-1">{errors.member2Email}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Documentation */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-4 text-juneBud">Required Documentation</h2>
                <Alert className="bg-juneBud/10 border-juneBud/20 text-linen mb-6">
                  <AlertDescription>
                    <div className="flex justify-between items-center mb-3">
                      <span className="font-semibold">Registration Fee:</span>
                      <span className="text-xl font-bold text-juneBud">Rp175.000</span>
                    </div>
                    <p className="text-sm mb-3">Please transfer the registration fee to:</p>
                    <div className="bg-black/30 rounded-lg p-3 mb-3">
                      <p className="font-medium">Bank BLU</p>
                      <p>Account Number: 007033578200</p>
                      <p>Account Name: Cherien Stevie</p>
                    </div>
                    <p className="text-sm mb-3">After making the payment, please upload your payment proof below.</p>
                    <p className="text-xs text-gray-400 mt-2">Maximum file size: 5MB</p>
                  </AlertDescription>
                </Alert>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Upload Payment Proof</label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed border-juneBud/30 rounded-lg hover:border-juneBud transition-colors bg-black/50">
                      <div className="space-y-1 text-center">
                        <label htmlFor="file-upload" className="cursor-pointer">
                          <Image className="mx-auto h-12 w-12 text-juneBud hover:text-juneBud/80 transition-colors" />
                        </label>
                        <div className="flex text-sm text-gray-300 justify-center">
                          <p className="text-gray-400">Upload image or PDF</p>
                        
                          <Input
                            id="file-upload"
                            name="registrationFile"
                            type="file"
                            className="sr-only"
                            onChange={handleFileChange}
                            accept=".jpg,.jpeg,.png,.pdf"
                          />
                        </div>
                        <p className="text-xs text-gray-500">
                          JPEG, PNG, or PDF only, maximum 5MB
                        </p>
                        {formData.registrationFile && (
                          <div className="mt-4 p-2 bg-juneBud/10 rounded border border-juneBud/20 text-sm">
                            <p className="font-medium text-linen">Selected file:</p>
                            <p className="text-sm text-linen/80">{formData.registrationFile.name}</p>
                            <p className="text-xs text-linen/60">
                              {(formData.registrationFile.size / (1024 * 1024)).toFixed(2)} MB
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                    {errors.registrationFile && (
                      <p className="text-red-400 text-sm mt-2">{errors.registrationFile}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-white/10">
            {currentStep > 1 && (
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                className="flex items-center bg-black/50 border-gray-700 hover:bg-black/80 text-linen"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Previous Step
              </Button>
            )}
            
            {currentStep < 3 ? (
              <Button
                type="button"
                onClick={nextStep}
                className="flex items-center ml-auto bg-juneBud hover:bg-juneBud/90 text-signalBlack"
              >
                Next Step
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center ml-auto bg-gradient-to-r from-juneBud to-cornflowerBlue hover:opacity-90 text-signalBlack"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    Complete Registration
                    <Check className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            )}
          </div>
        </form>
      </div>

      <Footer />
    </div>
  );
}