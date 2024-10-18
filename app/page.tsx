import Link from 'next/link';
import { Button } from "@/components/ui/button";
import Image from 'next/image';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <div className="flex flex-col items-center space-y-8">
        <div>
          <Image src="/images/logo-smooth-todo.svg" alt="Smooth Todo Logo" width={200} height={200} priority />
        </div>
        <div className="flex flex-col space-y-4 w-full max-w-xs">
          <Button asChild variant="default">
            <Link href="/login">Login</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/register">Register</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
