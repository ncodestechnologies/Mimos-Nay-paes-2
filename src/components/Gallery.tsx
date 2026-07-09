import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Image as ImageIcon, Search, Tag, Eye, X, MessageCircle, Calendar, Grid } from "lucide-react";
import { GalleryItem } from "../types";

export default function Gallery() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("Todos");
  const [search, setSearch] = useState("");
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);

  useEffect(() => {
    fetchGallery();
  }, []);

  const fetchGallery = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/gallery");
      if (res.ok) {
        const data = await res.json();
        setItems(data);
      }
    } catch (err) {
      console.error("Erro ao carregar galeria:", err);
    } finally {
      setLoading(false);
    }
  };

  // Extract unique categories
  const categories = ["Todos", ...Array.from(new Set(items.map(item => item.category).filter(Boolean))) as string[]];

  const filteredItems = items.filter(item => {
    const matchesFilter = filter === "Todos" || item.category === filter;
    const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase()) || 
                          (item.description && item.description.toLowerCase().includes(search.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 md:py-16">
      {/* Page Header */}
      <div className="text-center mb-12">
        <h1 className="font-display text-4xl md:text-5xl text-stone-800 mb-4 tracking-tight">
          Galeria de Inspirações
        </h1>
        <div className="w-24 h-1 bg-gradient-to-r from-gold-500 to-rose-300 mx-auto rounded-full mb-6"></div>
        <p className="text-stone-600 max-w-2xl mx-auto font-sans leading-relaxed text-base">
          Explore as criações mais lindas e delicadas encomendadas pelos nossos clientes. Cada peça é uma história contada em forma de afeto.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 bg-beige-50/50 p-6 rounded-2xl border border-beige-100">
        {/* Categories Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider whitespace-nowrap transition cursor-pointer ${
                filter === cat
                  ? "bg-gradient-to-r from-stone-900 to-stone-800 text-gold-400 shadow-sm"
                  : "bg-white text-stone-600 border border-beige-200 hover:bg-beige-50"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Field */}
        <div className="relative w-full md:w-80">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-stone-400">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Buscar na galeria..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl text-sm border border-beige-200 focus:outline-none focus:ring-2 focus:ring-gold-500 bg-white text-stone-800 transition"
          />
        </div>
      </div>

      {/* Gallery Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-gold-200 border-t-gold-500 rounded-full animate-spin"></div>
          <p className="text-stone-500 text-sm mt-4">Carregando mimos encantadores...</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-beige-100">
          <ImageIcon className="w-12 h-12 text-stone-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-stone-700">Nenhuma inspiração encontrada</h3>
          <p className="text-stone-500 text-sm mt-1 max-w-sm mx-auto">
            Não encontramos nenhuma foto que coincida com a busca ou filtro selecionado no momento.
          </p>
        </div>
      ) : (
        <motion.div 
          layout
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8"
        >
          <AnimatePresence mode="popLayout">
            {filteredItems.map((item) => (
              <motion.div
                layout
                key={item.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                onClick={() => setSelectedItem(item)}
                className="group relative bg-white rounded-2xl overflow-hidden border border-beige-100 shadow-sm hover:shadow-md transition duration-300 cursor-pointer"
              >
                {/* Image Container */}
                <div className="aspect-[4/3] w-full overflow-hidden bg-stone-100 relative">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-stone-900/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <span className="p-3 bg-white/90 backdrop-blur-sm rounded-full text-stone-800 transform scale-90 group-hover:scale-100 transition duration-300">
                      <Eye className="w-5 h-5" />
                    </span>
                  </div>
                  
                  {/* Category Tag */}
                  {item.category && (
                    <span className="absolute top-3 left-3 px-2.5 py-1 bg-white/90 backdrop-blur-sm border border-beige-100 text-stone-700 text-[10px] font-bold uppercase tracking-wider rounded-full shadow-sm">
                      {item.category}
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="p-5">
                  <h3 className="font-display text-lg text-stone-800 font-semibold group-hover:text-rose-500 transition-colors line-clamp-1">
                    {item.title}
                  </h3>
                  {item.description && (
                    <p className="text-stone-500 text-xs mt-1.5 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-beige-50 text-[10px] text-stone-400 font-medium">
                    <span className="flex items-center gap-1">
                      <Grid className="w-3.5 h-3.5" /> Inspiração
                    </span>
                    <span>{new Date(item.createdAt).toLocaleDateString("pt-BR")}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-stone-900/80 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setSelectedItem(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl overflow-hidden shadow-2xl max-w-4xl w-full grid grid-cols-1 md:grid-cols-12 max-h-[90vh] md:max-h-[80vh]"
            >
              {/* Image Section */}
              <div className="md:col-span-7 bg-stone-950 flex items-center justify-center relative min-h-[300px] max-h-[50vh] md:max-h-full">
                <img
                  src={selectedItem.imageUrl}
                  alt={selectedItem.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-contain max-h-[50vh] md:max-h-[80vh]"
                />
                
                {/* Category overlay */}
                {selectedItem.category && (
                  <span className="absolute top-4 left-4 px-3 py-1 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-wider rounded-full">
                    {selectedItem.category}
                  </span>
                )}
              </div>

              {/* Details Section */}
              <div className="md:col-span-5 p-6 md:p-8 flex flex-col justify-between h-full bg-white">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-gold-600 font-bold uppercase text-[10px] tracking-wider bg-gold-50 px-2 py-1 rounded">
                      Exclusivo Mimos
                    </span>
                    <button
                      onClick={() => setSelectedItem(null)}
                      className="p-1.5 hover:bg-stone-100 rounded-full text-stone-500 transition cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <h2 className="font-display text-2xl text-stone-800 font-bold leading-tight mb-3">
                    {selectedItem.title}
                  </h2>

                  {selectedItem.description && (
                    <p className="text-stone-600 text-sm leading-relaxed mb-6">
                      {selectedItem.description}
                    </p>
                  )}

                  <div className="bg-beige-50/50 p-4 rounded-2xl border border-beige-100/50 space-y-2 mb-6">
                    <div className="flex items-center justify-between text-xs text-stone-500">
                      <span>Adicionado em:</span>
                      <span className="font-medium">{new Date(selectedItem.createdAt).toLocaleDateString("pt-BR")}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-stone-500">
                      <span>Personalização:</span>
                      <span className="font-semibold text-rose-500 uppercase tracking-wider text-[10px]">Sob Medida</span>
                    </div>
                  </div>
                </div>

                {/* WhatsApp Action Call */}
                <div>
                  <a
                    href={`https://wa.me/5511999998888?text=Olá!%20Vi%20esse%20mimo%20lindo%20na%20Galeria%20e%20gostaria%20de%20um%20orçamento%20parecido:%20"${encodeURIComponent(selectedItem.title)}"%20(${encodeURIComponent(selectedItem.imageUrl)})`}
                    target="_blank"
                    referrerPolicy="no-referrer"
                    className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-center text-xs font-bold tracking-wider uppercase transition flex items-center justify-center gap-2 shadow-md hover:shadow-emerald-200/50"
                  >
                    <MessageCircle className="w-4 h-4 fill-current" /> Quero um Orçamento Igual
                  </a>
                  <p className="text-[10px] text-stone-400 text-center mt-2 font-medium">
                    Clique para iniciar uma conversa no WhatsApp
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
