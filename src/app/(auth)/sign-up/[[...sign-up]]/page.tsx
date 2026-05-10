import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-bg-base">
      <SignUp 
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "bg-bg-elevated border-border-default shadow-2xl rounded-3xl",
            headerTitle: "text-text-primary",
            headerSubtitle: "text-text-muted",
            socialButtonsBlockButton: "bg-bg-surface border-border-subtle text-text-primary hover:bg-bg-subtle",
            socialButtonsBlockButtonText: "text-text-primary",
            formButtonPrimary: "bg-accent-primary hover:bg-accent-primary/90 text-bg-base font-bold",
            formFieldLabel: "text-text-secondary",
            formFieldInput: "bg-bg-surface border-border-subtle text-text-primary rounded-xl",
            footerActionText: "text-text-muted",
            footerActionLink: "text-accent-primary hover:text-accent-primary/80"
          }
        }}
      />
    </div>
  );
}
