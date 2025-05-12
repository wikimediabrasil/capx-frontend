import Image from "next/image";
import Link from "next/link";
import capXLogo from "@/public/static/images/capx_minimalistic_logo.svg";

export default function Terms() {
  return (
    <main className="flex flex-wrap flex-col w-full h-screen bg-zinc-50 font-montserrat text-capx-secondary-gray">
      <div className="flex flex-wrap w-1/3 mx-auto mt-36 font-montserrat text-justify">
        <Link href="/" className="w-full mb-8">
          <Image
            priority
            src={capXLogo}
            alt="Capacity Exchange logo"
            className="w-full sm:w-14"
          />
        </Link>
        <h2 className="w-full mb-4 sm:text-xl">Before you log in</h2>
        <p className="w-full mb-8">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla id
          aliquam sem, non congue sapien. Donec vel cursus erat. Sed sagittis
          felis nec dignissim pulvinar. Nunc blandit convallis porta. Proin vel
          ligula non tellus interdum gravida a vitae arcu. Nulla non molestie
          sapien. Orci varius natoque penatibus et magnis dis parturient montes,
          nascetur ridiculus mus. Sed ultricies ipsum ut fermentum pretium. Sed
          ultrices varius auctor. Ut interdum et arcu id convallis. Aliquam erat
          volutpat.
        </p>
        <Link
          href="/"
          className="w-full bg-capx-secondary-green hover:bg-capx-primary-green text-[#F6F6F6] hover:text-capx-dark-bg px-2 sm:px-8 py-2 rounded-full text-center"
        >
          Login
        </Link>
      </div>
    </main>
  );
}
