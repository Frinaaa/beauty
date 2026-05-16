"use client";

import { useState } from "react";
import { Mail, Lock, ArrowRight, Loader2 } from "lucide-react";
import { signInAction, signUpAction } from "@/src/app/actions/auth";

import { useRouter } from "next/navigation";

export default function AuthScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const validateEmail = (val: string) => {
    if (!val) {
      setEmailError("Email is required");
      return false;
    } else if (!/\S+@\S+\.\S+/.test(val)) {
      setEmailError("Please enter a valid email address");
      return false;
    }
    setEmailError(null);
    return true;
  };

  const validatePassword = (val: string) => {
    if (!val) {
      setPasswordError("Password is required");
      return false;
    } else if (val.length < 6) {
      setPasswordError("Password must be at least 6 characters long");
      return false;
    }
    setPasswordError(null);
    return true;
  };

  const validateForm = () => {
    setErrorMsg(null);
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);
    return isEmailValid && isPasswordValid;
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setLoading(true);
    setErrorMsg(null);

    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);

    try {
      const res = await signInAction(formData);
      if (res?.error) throw new Error(res.error);
      router.push("/seller");
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred during authentication.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBFB] flex flex-col items-center justify-center p-4 font-sans relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-[#E9967A]/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-[#4A1523]/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md z-10">
        <div className="text-center mb-10">
          <h1 className="text-5xl font-light tracking-[6px] text-[#4A1523] mb-3">BEAUTY</h1>
          <p className="text-[#4A1523]/60 tracking-widest text-sm uppercase">Seller Portal</p>
        </div>

        <div className="bg-white/60 backdrop-blur-xl border border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl p-8 relative">
          
          {errorMsg && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100 text-center">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-[#4A1523]/80 mb-2">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-[#4A1523]/40" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { 
                    const val = e.target.value;
                    setEmail(val); 
                    validateEmail(val); 
                  }}
                  className={`w-full pl-11 pr-4 py-3 bg-white/50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E9967A]/50 transition-all text-[#4A1523] ${emailError ? 'border-red-300' : 'border-[#4A1523]/10'}`}
                  placeholder="hello@luxurybeauty.com"
                />
              </div>
              {emailError && <p className="text-red-500 text-xs mt-1 ml-1">{emailError}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-[#4A1523]/80 mb-2">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-[#4A1523]/40" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => { 
                    const val = e.target.value;
                    setPassword(val); 
                    validatePassword(val); 
                  }}
                  className={`w-full pl-11 pr-4 py-3 bg-white/50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E9967A]/50 transition-all text-[#4A1523] ${passwordError ? 'border-red-300' : 'border-[#4A1523]/10'}`}
                  placeholder="••••••••"
                />
              </div>
              {passwordError && <p className="text-red-500 text-xs mt-1 ml-1">{passwordError}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 mt-2 bg-[#4A1523] hover:bg-[#3A101C] text-white rounded-xl transition-all duration-300 shadow-lg shadow-[#4A1523]/20 font-medium tracking-wide flex justify-center items-center group disabled:opacity-70"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-xs text-[#4A1523]/40 font-light italic">
              Exclusive access for authorized beauty administrators only.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}