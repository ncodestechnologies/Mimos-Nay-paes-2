import React from "react";
import { Heart, ShieldCheck, Eye, Star } from "lucide-react";

export default function AboutUs() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-12 md:py-16">
      {/* Hero Header */}
      <div className="text-center mb-16">
        <h1 className="font-display text-4xl md:text-5xl text-stone-800 mb-4 tracking-tight">
          Nossa História
        </h1>
        <div className="w-24 h-1 bg-gradient-to-r from-gold-500 to-rose-300 mx-auto rounded-full mb-6"></div>
        <p className="text-stone-600 max-w-2xl mx-auto font-sans leading-relaxed text-lg">
          Transformando sentimentos em presentes inesquecíveis. Conheça o ateliê que dá vida aos seus mimos mais delicados.
        </p>
      </div>

      {/* Story Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-20">
        <div className="relative">
          <div className="absolute -inset-2 bg-gradient-to-r from-rose-200 to-gold-200 rounded-2xl blur-lg opacity-30"></div>
          <img
            src="https://images.unsplash.com/photo-1513151233558-d860c5398176?q=80&w=800&auto=format&fit=crop"
            alt="Ateliê de Presentes"
            className="relative rounded-2xl shadow-xl w-full object-cover h-[400px] border border-beige-100"
          />
          <div className="absolute -bottom-6 -right-6 bg-white p-6 rounded-2xl shadow-lg border border-beige-100 hidden sm:block">
            <span className="font-display text-4xl text-gold-500 block font-bold">100%</span>
            <span className="text-stone-500 text-sm uppercase tracking-wider font-medium">Feito à Mão com Amor</span>
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="font-display text-3xl text-stone-800">Mimos Nay Paes</h2>
          <p className="text-stone-600 leading-relaxed">
            Fundado por Nayara Paes, o ateliê <strong>Mimos Nay Paes</strong> nasceu do desejo profundo de celebrar as conexões humanas através de presentes finos e totalmente personalizados. O que começou como uma paixão pessoal por encantar pessoas queridas transformou-se em uma empresa especializada em criar memórias afetivas.
          </p>
          <p className="text-stone-600 leading-relaxed">
            Nossos mimos vão muito além de meros itens de consumo: cada cesta de café da manhã, cada caneca gravada a laser, cada caixa surpresa e arranjo de flores é meticulosamente planejado, higienizado e decorado para expressar o amor, carinho ou gratidão de quem presenteia.
          </p>
          <p className="text-stone-600 leading-relaxed">
            Localizado em São Paulo, o ateliê atende datas comemorativas, aniversários, casamentos, eventos corporativos e mimos infantis, sempre com embalagens de alto padrão, materiais selecionados e um acabamento que reflete a essência delicada e sofisticada da nossa marca.
          </p>
        </div>
      </div>

      {/* Mission Vision Values Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        {/* Missão */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-beige-100 hover:shadow-md transition-shadow duration-300">
          <div className="w-12 h-12 rounded-xl bg-rose-100 flex items-center justify-center mb-6">
            <Heart className="text-rose-500 w-6 h-6" />
          </div>
          <h3 className="font-display text-2xl text-stone-800 mb-3">Missão</h3>
          <p className="text-stone-600 leading-relaxed text-sm">
            Oferecer experiências afetivas singulares por meio de presentes personalizados premium, surpreendendo quem recebe e facilitando a demonstração sincera de afeto.
          </p>
        </div>

        {/* Visão */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-beige-100 hover:shadow-md transition-shadow duration-300">
          <div className="w-12 h-12 rounded-xl bg-gold-100 flex items-center justify-center mb-6">
            <Eye className="text-gold-500 w-6 h-6" />
          </div>
          <h3 className="font-display text-2xl text-stone-800 mb-3">Visão</h3>
          <p className="text-stone-600 leading-relaxed text-sm">
            Ser reconhecida como a principal marca de referência em presentes personalizados e cestas de luxo, expandindo nossa presença digital e física com excelência.
          </p>
        </div>

        {/* Valores */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-beige-100 hover:shadow-md transition-shadow duration-300">
          <div className="w-12 h-12 rounded-xl bg-stone-100 flex items-center justify-center mb-6">
            <ShieldCheck className="text-stone-700 w-6 h-6" />
          </div>
          <h3 className="font-display text-2xl text-stone-800 mb-3">Valores</h3>
          <ul className="text-stone-600 space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-gold-400 rounded-full"></span>
              <strong>Afeto e Sensibilidade</strong>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-gold-400 rounded-full"></span>
              <strong>Qualidade Meticulosa</strong>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-gold-400 rounded-full"></span>
              <strong>Transparência e Confiança</strong>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-gold-400 rounded-full"></span>
              <strong>Personalização com Significado</strong>
            </li>
          </ul>
        </div>
      </div>

      {/* Decorative Testimonials Quote Section */}
      <div className="bg-gradient-to-r from-beige-50 to-gold-50 rounded-2xl p-8 md:p-12 border border-beige-200 text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-rose-200/20 rounded-full blur-2xl"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-gold-200/20 rounded-full blur-2xl"></div>
        
        <div className="relative z-10 max-w-3xl mx-auto">
          <div className="flex justify-center gap-1 text-gold-500 mb-4">
            <Star className="fill-current w-5 h-5" />
            <Star className="fill-current w-5 h-5" />
            <Star className="fill-current w-5 h-5" />
            <Star className="fill-current w-5 h-5" />
            <Star className="fill-current w-5 h-5" />
          </div>
          <p className="font-display text-xl md:text-2xl text-stone-700 italic mb-6">
            "Não foi apenas uma cesta de café entregue, foi um abraço em forma de flores e canecas gravadas. Minha mãe chorou de emoção!"
          </p>
          <span className="block font-sans font-semibold text-stone-800 text-sm tracking-wider uppercase">
            — Cliente Satisfeita, São Paulo
          </span>
        </div>
      </div>
    </div>
  );
}
