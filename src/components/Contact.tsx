import React, { useState } from "react";
import { Phone, Mail, Instagram, MapPin, Clock, Send, CheckCircle2 } from "lucide-react";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    whatsapp: "",
    subject: "Presentes Personalizados",
    message: ""
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: "", email: "", whatsapp: "", subject: "Presentes Personalizados", message: "" });
    }, 4000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 md:py-16">
      <div className="text-center mb-16">
        <h1 className="font-display text-4xl md:text-5xl text-stone-800 mb-4 tracking-tight">
          Fale Conosco
        </h1>
        <div className="w-24 h-1 bg-gradient-to-r from-gold-500 to-rose-300 mx-auto rounded-full mb-6"></div>
        <p className="text-stone-600 max-w-2xl mx-auto font-sans leading-relaxed text-lg">
          Quer planejar um mimo corporativo, tirar dúvidas de personalizações ou fazer uma encomenda sob medida? Estamos aqui para escutar você.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start mb-16">
        {/* Contact Info Panel */}
        <div className="lg:col-span-5 space-y-8 bg-beige-50 p-8 rounded-2xl border border-beige-200">
          <h2 className="font-display text-2xl text-stone-800 mb-2">Ateliê Mimos Nay Paes</h2>
          <p className="text-stone-600 text-sm leading-relaxed mb-6">
            Venha nos fazer uma visita virtual ou entre em contato direto para orçamentos urgentes. Atendimento humanizado e dedicado.
          </p>

          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-gold-100 flex items-center justify-center shrink-0 mt-0.5">
                <Phone className="text-gold-600 w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-stone-800 text-sm">Telefone & WhatsApp</h4>
                <p className="text-stone-600 text-sm mt-0.5">(11) 99999-8888</p>
                <a
                  href="https://wa.me/5511999998888?text=Olá!%20Gostaria%20de%20um%20orçamento%20da%20Mimos%20Nay%20Paes."
                  target="_blank"
                  referrerPolicy="no-referrer"
                  className="text-xs text-gold-600 hover:underline font-semibold mt-1 inline-block"
                >
                  Iniciar conversa rápida no WhatsApp
                </a>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-gold-100 flex items-center justify-center shrink-0 mt-0.5">
                <Mail className="text-gold-600 w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-stone-800 text-sm">E-mail corporativo</h4>
                <p className="text-stone-600 text-sm mt-0.5">contato@mimosnaypaes.com.br</p>
                <p className="text-xs text-stone-400">Tempo de resposta: até 4 horas úteis</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-gold-100 flex items-center justify-center shrink-0 mt-0.5">
                <Instagram className="text-gold-600 w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-stone-800 text-sm">Instagram Oficial</h4>
                <p className="text-stone-600 text-sm mt-0.5">@mimosnaypaes</p>
                <a
                  href="https://instagram.com/mimosnaypaes"
                  target="_blank"
                  referrerPolicy="no-referrer"
                  className="text-xs text-gold-600 hover:underline font-semibold mt-1 inline-block"
                >
                  Ver fotos e novidades diárias
                </a>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-gold-100 flex items-center justify-center shrink-0 mt-0.5">
                <MapPin className="text-gold-600 w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-stone-800 text-sm">Localização do Ateliê</h4>
                <p className="text-stone-600 text-sm mt-0.5">Avenida Paulista, 1000 — Bela Vista</p>
                <p className="text-xs text-stone-400">São Paulo - SP, CEP 01310-100</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-gold-100 flex items-center justify-center shrink-0 mt-0.5">
                <Clock className="text-gold-600 w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-stone-800 text-sm">Horário de Funcionamento</h4>
                <p className="text-stone-600 text-sm mt-0.5">Segunda a Sexta: 08:30 às 18:30</p>
                <p className="text-stone-600 text-sm">Sábados: 09:00 às 13:00</p>
                <p className="text-xs text-rose-500 font-medium mt-1">Retiradas agendadas aos domingos</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-7 bg-white p-8 rounded-2xl border border-beige-100 shadow-sm relative">
          <h3 className="font-display text-2xl text-stone-800 mb-6">Envie uma Mensagem</h3>

          {submitted && (
            <div className="mb-6 p-4 bg-emerald-50 text-emerald-800 rounded-lg flex items-center gap-3 border border-emerald-200">
              <CheckCircle2 className="text-emerald-600 shrink-0" />
              <div>
                <p className="font-semibold">Mensagem enviada!</p>
                <p className="text-sm">A equipe Mimos Nay Paes retornará seu contato em breve no e-mail ou WhatsApp.</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-1.5">Seu Nome completo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Mariana Medeiros"
                  className="mimos-input"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-1.5">Seu E-mail *</label>
                <input
                  type="email"
                  required
                  placeholder="Ex: mariana@gmail.com"
                  className="mimos-input"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-1.5">Telefone / WhatsApp</label>
                <input
                  type="text"
                  placeholder="Ex: (11) 99999-9999"
                  className="mimos-input"
                  value={formData.whatsapp}
                  onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-1.5">Assunto de interesse</label>
                <select
                  className="mimos-input"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                >
                  <option value="Presentes Personalizados">Presentes Personalizados</option>
                  <option value="Cestas Luxo">Cestas Luxo</option>
                  <option value="Caixas Surpresa / Explosão">Caixas Surpresa / Explosão</option>
                  <option value="Eventos e Brindes Corporativos">Eventos Corporativos</option>
                  <option value="Outros Assuntos">Outros Assuntos</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-1.5">Como podemos ajudar você? *</label>
              <textarea
                required
                rows={5}
                placeholder="Detalhe o seu pedido, datas especiais, temas preferidos e nomes para personalização."
                className="mimos-input"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              ></textarea>
            </div>

            <button type="submit" className="mimos-btn-primary w-full flex items-center justify-center gap-2">
              <Send className="w-4 h-4" /> Enviar Mensagem de Contato
            </button>
          </form>
        </div>
      </div>

      {/* Embedded Location Map Representation */}
      <div className="relative rounded-2xl overflow-hidden border border-beige-200 shadow-sm h-96">
        {/* Aesthetic Map Styling */}
        <div className="absolute inset-0 bg-stone-100 flex flex-col items-center justify-center p-4 text-center">
          <div className="w-16 h-16 rounded-full bg-rose-100 flex items-center justify-center animate-bounce mb-4">
            <MapPin className="text-rose-500 w-8 h-8" />
          </div>
          <h4 className="font-display text-2xl text-stone-800 font-semibold mb-2">Estamos Localizados na Avenida Paulista</h4>
          <p className="text-stone-600 max-w-md mx-auto text-sm mb-4">
            Nosso ateliê fica próximo ao metrô Trianon-Masp. Agende uma visita para conhecer nosso mostruário de canecas e fitas artesanais!
          </p>
          <div className="bg-white px-4 py-2 rounded-lg border border-beige-200 text-xs font-semibold text-stone-500 tracking-wider uppercase">
            Avenida Paulista, 1000 — São Paulo, SP
          </div>
        </div>
        {/* Delicate decorative map grid lines using pure CSS background */}
        <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#ab8742_1px,transparent_1px)] [background-size:16px_16px]"></div>
      </div>
    </div>
  );
}
