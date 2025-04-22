import EmailForm from "@/components/email-form";
import House from "@/components/house";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-green-200 to-orange-200">
      <nav className="flex justify-between px-4 py-3">
        <div className="flex items-center gap-x-2">
          <Image src="/convivito.png" alt="El logo de Convivito" width={1200} height={1200} className="size-10 lg:size-12" priority />
          <h1 className="text-base lg:text-lg font-bold">Convivito</h1>
        </div>
        <a href="https://github.com/adrgarcha/convivito" target="_blank" rel="noopener noreferrer" className="h-fit">
          <Button className="group hover:cursor-pointer">
            <span>Míralo en GitHub</span>
            <ArrowRight className="group-hover:translate-x-0.5 transition-transform" />
          </Button>
        </a>
      </nav>
      <main className="grid grid-rows-2 lg:grid-rows-1 lg:grid-cols-2 grow px-10 lg:px-16">
        <div className="lg:w-xl mt-16 lg:mt-52">
          <h2 className="text-4xl lg:text-5xl font-bold mb-3 text-center lg:text-left">Gestiona tu convivencia <br /> desde WhatsApp</h2>
          <p className="text-base lg:text-lg text-gray-700 mb-6 text-center lg:text-left">
            <b>Organizar un piso compartido puede ser un infierno 🔥.</b> Convivito es el compañero que se encarga de lo que nadie quiere hacer 🙅‍♂️:
            repartir tareas, gestionar gastos y mantener la paz. Únete a nuestra comunidad 🤝 y recibe actualizaciones.
          </p>
          <EmailForm />
        </div>
        <House />
      </main>
    </div>
  );
}
