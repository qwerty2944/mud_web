"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/shared/api";

// ============ 상수 ============

const SAVED_EMAILS_KEY = "mud-saved-emails";
const MAX_SAVED_EMAILS = 5;

// ============ 스키마 ============

const loginSchema = z.object({
  email: z.string().email("올바른 이메일을 입력하세요"),
  password: z.string().min(6, "비밀번호는 6자 이상이어야 합니다"),
});

const signupSchema = z
  .object({
    email: z.string().email("올바른 이메일을 입력하세요"),
    password: z.string().min(6, "비밀번호는 6자 이상이어야 합니다"),
    confirmPassword: z.string().min(6, "비밀번호 확인을 입력하세요"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "비밀번호가 일치하지 않습니다",
    path: ["confirmPassword"],
  });

type LoginFormData = z.infer<typeof loginSchema>;
type SignupFormData = z.infer<typeof signupSchema>;
type AuthMode = "login" | "signup";

// ============ 로컬 스토리지 유틸 ============

function getSavedEmails(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const saved = localStorage.getItem(SAVED_EMAILS_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function saveEmail(email: string) {
  if (typeof window === "undefined") return;
  try {
    const emails = getSavedEmails().filter((e) => e !== email);
    emails.unshift(email);
    localStorage.setItem(
      SAVED_EMAILS_KEY,
      JSON.stringify(emails.slice(0, MAX_SAVED_EMAILS))
    );
  } catch {}
}

function removeEmail(email: string) {
  if (typeof window === "undefined") return;
  try {
    const emails = getSavedEmails().filter((e) => e !== email);
    localStorage.setItem(SAVED_EMAILS_KEY, JSON.stringify(emails));
  } catch {}
}

// ============ 컴포넌트 ============

function EyeIcon({ visible }: { visible: boolean }) {
  if (visible) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
      </svg>
    );
  }
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
    </svg>
  );
}

function PasswordInput({
  placeholder,
  error,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { error?: string }) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div>
      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          placeholder={placeholder}
          className={`w-full px-4 py-3 pr-12 bg-black/50 border-2 text-amber-100 placeholder-amber-700 focus:outline-none focus:border-amber-400 font-mono ${
            error ? "border-red-500" : "border-amber-900"
          }`}
          {...props}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-700 hover:text-amber-400 transition-colors"
        >
          <EyeIcon visible={showPassword} />
        </button>
      </div>
      {error && <p className="mt-1 text-sm text-red-400 font-mono">&gt; {error}</p>}
    </div>
  );
}

interface EmailInputProps {
  value: string;
  onChange: (value: string) => void;
  savedEmails: string[];
  onRemoveEmail: (email: string) => void;
  error?: string;
}

function EmailInput({ value, onChange, savedEmails, onRemoveEmail, error }: EmailInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (email: string) => {
    onChange(email);
    setIsOpen(false);
    setIsTyping(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
    setIsTyping(true);
  };

  const handleInputFocus = () => {
    if (savedEmails.length > 0 && !isTyping) {
      setIsOpen(true);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="relative">
        <input
          ref={inputRef}
          type="email"
          value={value}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          placeholder="이메일 입력 또는 선택"
          className={`w-full px-4 py-3 pr-10 bg-black/50 border-2 text-amber-100 placeholder-amber-700 focus:outline-none focus:border-amber-400 font-mono ${
            error ? "border-red-500" : "border-amber-900"
          }`}
        />
        {savedEmails.length > 0 && (
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-700 hover:text-amber-400 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={`w-5 h-5 transition-transform ${isOpen ? "rotate-180" : ""}`}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
            </svg>
          </button>
        )}
      </div>

      {error && <p className="mt-1 text-sm text-red-400 font-mono">&gt; {error}</p>}

      {isOpen && savedEmails.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-gray-900 border-2 border-amber-900 shadow-lg max-h-48 overflow-y-auto">
          <div className="px-3 py-2 text-xs text-amber-600 border-b border-amber-900/50 font-mono">
            [ 최근 로그인 ]
          </div>
          {savedEmails.map((email) => (
            <div
              key={email}
              className="flex items-center justify-between px-3 py-2 hover:bg-amber-900/30 cursor-pointer group"
            >
              <button
                type="button"
                onClick={() => handleSelect(email)}
                className="flex-1 text-left text-amber-100 font-mono text-sm truncate"
              >
                &gt; {email}
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveEmail(email);
                }}
                className="ml-2 text-amber-700 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              setIsTyping(true);
              inputRef.current?.focus();
            }}
            className="w-full px-3 py-2 text-left text-amber-600 hover:bg-amber-900/30 font-mono text-sm border-t border-amber-900/50"
          >
            + 직접 입력
          </button>
        </div>
      )}
    </div>
  );
}

// ============ 메인 컴포넌트 ============

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("login");
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [savedEmails, setSavedEmails] = useState<string[]>([]);

  useEffect(() => {
    setSavedEmails(getSavedEmails());
  }, []);

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const signupForm = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: { email: "", password: "", confirmPassword: "" },
  });

  // 저장된 이메일이 있으면 첫번째 이메일로 초기화
  useEffect(() => {
    if (savedEmails.length > 0 && !loginForm.getValues("email")) {
      loginForm.setValue("email", savedEmails[0]);
    }
  }, [savedEmails, loginForm]);

  const handleRemoveEmail = (email: string) => {
    removeEmail(email);
    setSavedEmails(getSavedEmails());
  };

  const handleLogin = async (data: LoginFormData) => {
    setLoading(true);
    setApiError(null);

    try {
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });
      if (error) throw error;

      // 로그인 성공 시 이메일 저장
      saveEmail(data.email);

      const { data: profile } = await supabase
        .from("profiles")
        .select("characters")
        .eq("id", authData.user.id)
        .single();

      const hasCharacter = profile?.characters && profile.characters.length > 0;
      router.push(hasCharacter ? "/game" : "/character-create");
    } catch (err) {
      setApiError(err instanceof Error ? err.message : "오류가 발생했습니다");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (data: SignupFormData) => {
    setLoading(true);
    setApiError(null);
    setMessage(null);

    try {
      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
      setMessage("이메일을 확인해주세요!");
      signupForm.reset();
    } catch (err) {
      setApiError(err instanceof Error ? err.message : "오류가 발생했습니다");
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setMode(mode === "login" ? "signup" : "login");
    setApiError(null);
    setMessage(null);
    loginForm.reset();
    signupForm.reset();
  };

  return (
    <div className="h-dvh w-full bg-gradient-to-b from-gray-950 via-gray-900 to-black flex items-center justify-center p-4">
      {/* 배경 효과 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-900/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-800/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* 터미널 스타일 프레임 */}
        <div className="border-2 border-amber-900 bg-black/80 shadow-2xl shadow-amber-900/20">
          {/* 헤더 바 */}
          <div className="flex items-center justify-between px-4 py-2 bg-amber-900/30 border-b border-amber-900">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
            </div>
            <span className="text-amber-600 font-mono text-sm">mud.connect</span>
          </div>

          <div className="p-6">
            {/* ASCII 아트 타이틀 */}
            <div className="text-center mb-6">
              <pre className="text-amber-500 font-mono text-xs leading-tight inline-block">
{`
 ███╗   ███╗██╗   ██╗██████╗
 ████╗ ████║██║   ██║██╔══██╗
 ██╔████╔██║██║   ██║██║  ██║
 ██║╚██╔╝██║██║   ██║██║  ██║
 ██║ ╚═╝ ██║╚██████╔╝██████╔╝
 ╚═╝     ╚═╝ ╚═════╝ ╚═════╝
`}
              </pre>
              <p className="text-amber-700 font-mono text-sm mt-2">
                ~ Fantasy Multi-User Dungeon ~
              </p>
            </div>

            {/* 시스템 메시지 */}
            <div className="mb-6 text-amber-600 font-mono text-sm">
              <p>&gt; {mode === "login" ? "모험가여, 접속하시오..." : "새로운 모험가를 등록합니다..."}</p>
              <p className="animate-pulse">_</p>
            </div>

            {mode === "login" ? (
              <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
                <div>
                  <label className="block text-amber-600 font-mono text-sm mb-1">[EMAIL]</label>
                  <EmailInput
                    value={loginForm.watch("email")}
                    onChange={(value) => loginForm.setValue("email", value)}
                    savedEmails={savedEmails}
                    onRemoveEmail={handleRemoveEmail}
                    error={loginForm.formState.errors.email?.message}
                  />
                </div>

                <div>
                  <label className="block text-amber-600 font-mono text-sm mb-1">[PASSWORD]</label>
                  <PasswordInput
                    placeholder="비밀번호"
                    {...loginForm.register("password")}
                    error={loginForm.formState.errors.password?.message}
                  />
                </div>

                {apiError && (
                  <div className="p-3 bg-red-900/30 border border-red-700 text-red-400 text-sm font-mono">
                    &gt; ERROR: {apiError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-amber-900/50 hover:bg-amber-800/50 disabled:bg-gray-800 disabled:cursor-not-allowed border-2 border-amber-700 hover:border-amber-500 text-amber-100 font-mono font-bold transition-all"
                >
                  {loading ? "[ 접속 중... ]" : "[ 접속하기 ]"}
                </button>
              </form>
            ) : (
              <form onSubmit={signupForm.handleSubmit(handleSignup)} className="space-y-4">
                <div>
                  <label className="block text-amber-600 font-mono text-sm mb-1">[EMAIL]</label>
                  <input
                    type="email"
                    placeholder="이메일"
                    {...signupForm.register("email")}
                    className={`w-full px-4 py-3 bg-black/50 border-2 text-amber-100 placeholder-amber-700 focus:outline-none focus:border-amber-400 font-mono ${
                      signupForm.formState.errors.email ? "border-red-500" : "border-amber-900"
                    }`}
                  />
                  {signupForm.formState.errors.email && (
                    <p className="mt-1 text-sm text-red-400 font-mono">
                      &gt; {signupForm.formState.errors.email.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-amber-600 font-mono text-sm mb-1">[PASSWORD]</label>
                  <PasswordInput
                    placeholder="비밀번호 (6자 이상)"
                    {...signupForm.register("password")}
                    error={signupForm.formState.errors.password?.message}
                  />
                </div>

                <div>
                  <label className="block text-amber-600 font-mono text-sm mb-1">[CONFIRM]</label>
                  <PasswordInput
                    placeholder="비밀번호 확인"
                    {...signupForm.register("confirmPassword")}
                    error={signupForm.formState.errors.confirmPassword?.message}
                  />
                </div>

                {apiError && (
                  <div className="p-3 bg-red-900/30 border border-red-700 text-red-400 text-sm font-mono">
                    &gt; ERROR: {apiError}
                  </div>
                )}

                {message && (
                  <div className="p-3 bg-green-900/30 border border-green-700 text-green-400 text-sm font-mono">
                    &gt; SUCCESS: {message}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-amber-900/50 hover:bg-amber-800/50 disabled:bg-gray-800 disabled:cursor-not-allowed border-2 border-amber-700 hover:border-amber-500 text-amber-100 font-mono font-bold transition-all"
                >
                  {loading ? "[ 등록 중... ]" : "[ 등록하기 ]"}
                </button>
              </form>
            )}

            {/* 모드 전환 */}
            <div className="mt-6 text-center">
              <button
                onClick={switchMode}
                className="text-amber-700 hover:text-amber-400 font-mono text-sm transition-colors"
              >
                {mode === "login"
                  ? "> 새로운 모험가 등록"
                  : "> 기존 모험가로 접속"}
              </button>
            </div>

            {/* 푸터 */}
            <div className="mt-6 pt-4 border-t border-amber-900/50 text-center">
              <p className="text-amber-800 font-mono text-xs">
                MUD v1.0.0 | Est. 2026
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
