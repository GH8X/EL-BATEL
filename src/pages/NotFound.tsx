import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="pt-[68px]">
      <section className="flex min-h-[70vh] items-center bg-black">
        <div className="container">
          <p className="eyebrow">ERROR 404</p>
          <h1 className="mt-5 font-display text-[64px] leading-[0.84] tracking-mega text-white sm:text-[140px]">
            PIECE NOT FOUND
          </h1>
          <p className="mt-6 max-w-md text-[14px] leading-relaxed text-white/50">
            This page is not in the archive. Editions close, drops end, links go quiet.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link to="/shop">BACK TO THE ARCHIVE</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/">RETURN HOME</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
