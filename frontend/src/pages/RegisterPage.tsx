import RegisterForm from "@/features/auth/components/RegisterForm";
import GLogin from "@/features/auth/components/GLogin";
import { Link } from "react-router-dom";

const RegisterPage = () => (
  <main className="min-h-svh bg-secondary p-4 text-foreground sm:p-6">
    <div className="mx-auto grid min-h-[calc(100svh-3rem)] max-w-[1232px] gap-10 lg:grid-cols-[552fr_632fr] lg:gap-12">
      <section aria-labelledby="register-welcome" className="flex flex-col rounded-[24px] border border-card/55 bg-card/30 px-6 py-8 backdrop-blur-[10px] sm:px-[39px] lg:min-h-[752px]">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-[11px] bg-warning/30">
            <img src="/images/login/booky-book.svg" alt="" width="24" height="24" />
          </span>
          <span className="text-[25px] font-bold leading-[1.4]">Booksy</span>
        </div>
        <h1 id="register-welcome" className="mt-10 text-[36px] font-bold leading-[1.4] sm:mt-[61px] sm:text-[44px]">
          Your next read<br />is waiting.
        </h1>
        <p className="mt-[19px] text-base leading-[1.4] text-muted-foreground">
          Join your campus library.<br />Discover, borrow, and save your favorites.
        </p>
        <div className="-mx-[14px] mt-8 flex justify-center">
          <img src="/images/login/reading.svg" alt="An open book above a stack of books beside a small plant" width="490" height="290" className="h-auto max-w-full" />
        </div>
        <p className="mt-10 text-[10px] font-bold leading-[1.4] text-muted-foreground lg:mt-auto lg:pt-10 lg:pb-5 text-center">
          YOUR CAMPUS LIBRARY, A LITTLE CLOSER.
        </p>
      </section>
      <section aria-labelledby="register-heading" className="flex flex-col items-center justify-center px-2 pb-6 sm:px-6 lg:justify-start lg:pl-0 lg:pr-[72px] lg:pt-[42px]">
        <div className="w-full max-w-[440px]">
          <h2 id="register-heading" className="text-[32px] font-bold leading-[1.4] text-primary">Create your account</h2>
          <p className="mt-[5px] text-sm leading-[1.4] text-muted-foreground">Your campus library, ready when you are.</p>
          <div className="mt-[28px]"><RegisterForm /></div>
          <div className="my-[23px] flex items-center gap-2 text-[11px] text-muted-foreground">
            <span className="h-px flex-1 bg-border/60" />
            <span>or continue with</span>
            <span className="h-px flex-1 bg-border/60" />
          </div>
          <GLogin layout="login" />
          <p className="mt-6 text-center text-[13px] text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="font-bold text-foreground transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring">Sign in</Link>
          </p>
        </div>
        <p className="mt-12 text-center text-[11px] text-muted-foreground lg:mt-[38px]">Booksy · Library Management System</p>
      </section>
    </div>
  </main>
);

export default RegisterPage;
