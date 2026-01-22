import React, { useState, useEffect, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInAnonymously, 
  onAuthStateChanged,
  signInWithCustomToken
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query,
  getDoc,
  deleteField
} from 'firebase/firestore';
import { 
  Beer, 
  Home, 
  Users, 
  Wallet, 
  Plus, 
  ThumbsUp, 
  CheckCircle, 
  Trash2, 
  ExternalLink,
  Settings,
  Edit2,
  Lock,
  Unlock,
  Menu,
  X,
  Image as ImageIcon,
  Calculator,
  Scale,
  ArrowRight,
  Euro, 
  RotateCw,
  Save,
  AlignLeft,
  Calendar,
  Car,
  MapPin,
  KeyRound,
  LogOut,
  UserCog,
  Link as LinkIcon
} from 'lucide-react';

// --- Configuration Firebase ---
const firebaseConfig = {
  apiKey: "AIzaSyDPkr06UgZa-EiveZrLzKkDbOOVB5AuYJU",
  authDomain: "evg-seb.firebaseapp.com",
  projectId: "evg-seb",
  storageBucket: "evg-seb.firebasestorage.app",
  messagingSenderId: "758953125301",
  appId: "1:758953125301:web:103e85e7a9744b8b54e5fc"
};

let app, auth, db;
try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
} catch (error) {
  console.error("Erreur initialisation Firebase:", error);
}

const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

// --- Utilitaires ---
const formatName = (name) => {
  return name.trim().charAt(0).toUpperCase() + name.trim().slice(1).toLowerCase();
};

const formatDateRange = (start, end) => {
  if (!start) return "";
  const d1 = new Date(start).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  if (!end || start === end) return d1;
  const d2 = new Date(end).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  return `Du ${d1} au ${d2}`;
};

// --- Composants UI "Féria" ---

const Button = ({ children, onClick, variant = 'primary', className = '', size = 'md', disabled = false, type="button" }) => {
  const baseStyle = "font-bold rounded-lg transition-all duration-200 flex items-center justify-center gap-2 transform active:scale-95";
  const variants = {
    primary: "bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-200 border-b-4 border-red-800 active:border-b-0 active:mt-1",
    secondary: "bg-green-700 hover:bg-green-800 text-white border-b-4 border-green-900 active:border-b-0 active:mt-1",
    danger: "bg-white border-2 border-red-200 text-red-600 hover:bg-red-50",
    ghost: "bg-transparent hover:bg-green-100 text-green-800 hover:text-green-900"
  };
  const sizes = {
    sm: "px-3 py-1.5 text-xs uppercase tracking-wide",
    md: "px-4 py-3",
    icon: "p-2"
  };

  return (
    <button 
      type={type}
      onClick={onClick} 
      disabled={disabled}
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {children}
    </button>
  );
};

const Card = ({ children, className = '' }) => (
  <div className={`bg-white border-2 border-green-100 rounded-xl p-4 shadow-xl shadow-green-900/5 ${className}`}>
    {children}
  </div>
);

const Badge = ({ children, type = 'neutral' }) => {
  const types = {
    neutral: "bg-gray-100 text-gray-600 border-gray-200",
    success: "bg-green-100 text-green-700 border-green-200", 
    warning: "bg-red-100 text-red-700 border-red-200", 
    info: "bg-blue-50 text-blue-600 border-blue-100",
  };
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-bold border ${types[type]} flex items-center gap-1`}>
      {children}
    </span>
  );
};

const BudgetCard = ({ title, amount, icon: Icon, color, desc }) => (
  <Card className="relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300 border-green-500/10">
    <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-green-800`}>
      <Icon className="w-24 h-24 transform translate-x-4 -translate-y-4" />
    </div>
    <div className="relative z-10">
      <div className={`flex items-center gap-2 mb-2 ${color}`}>
        <Icon className="w-5 h-5" />
        <span className="font-bold uppercase text-xs tracking-wider text-gray-500">{title}</span>
      </div>
      <div className="text-4xl font-black text-green-900 mb-1">
        {amount.toFixed(0)} <span className="text-lg text-gray-400 font-medium">€</span>
      </div>
      <p className="text-xs text-gray-400">{desc}</p>
    </div>
  </Card>
);

// --- Formulaires & Cartes ---

const AddExpenseForm = ({ participants, onAdd }) => {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [payer, setPayer] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!payer) return alert('Choisis un payeur !');
    onAdd({
      title,
      amount: parseFloat(amount) || 0,
      payer
    });
    setTitle('');
    setAmount('');
    setPayer('');
    setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="w-full py-4 border-2 border-dashed border-green-300 rounded-xl text-green-600 hover:text-green-700 hover:bg-green-50 transition-all flex items-center justify-center gap-2 font-bold bg-white"
      >
        <Plus className="w-5 h-5" /> Ajouter une dépense manuelle
      </button>
    );
  }

  return (
    <Card className="animate-fade-in border-green-500">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-lg text-green-900">💸 Nouvelle dépense</h3>
        <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-red-500"><X className="w-5 h-5" /></button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs uppercase text-gray-500 font-bold mb-1">Quoi ?</label>
          <input 
            value={title} onChange={e => setTitle(e.target.value)} required 
            placeholder="Ex: Courses Carrefour, Essence..."
            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-green-500 outline-none"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs uppercase text-gray-500 font-bold mb-1">Combien ?</label>
            <input 
              type="number" value={amount} onChange={e => setAmount(e.target.value)} required 
              placeholder="0"
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-green-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs uppercase text-gray-500 font-bold mb-1">Qui a payé ?</label>
            <select 
              value={payer} onChange={e => setPayer(e.target.value)} required
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-green-500 outline-none"
            >
              <option value="">Choisir...</option>
              <option value="Tous">Tous (Chacun sa part)</option>
              {participants.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="ghost" size="sm" onClick={() => setIsOpen(false)}>Annuler</Button>
          <Button type="submit" size="sm">Ajouter</Button>
        </div>
      </form>
    </Card>
  );
};

const AddItemForm = ({ type, onAdd, activeTab }) => {
  const [title, setTitle] = useState('');
  const [cost, setCost] = useState('');
  const [priceType, setPriceType] = useState('total');
  const [link, setLink] = useState('');
  const [description, setDescription] = useState('');
  const [imageKeyword, setImageKeyword] = useState('');
  const [imagePasteUrl, setImagePasteUrl] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Logique Image : URL collée > Mot clé IA
    let finalImageUrl = null;
    if (imagePasteUrl.trim()) {
        finalImageUrl = imagePasteUrl.trim();
    } else if (imageKeyword.trim()) {
        finalImageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(imageKeyword)}`;
    }

    onAdd({
      type: activeTab === 'activities' ? 'activity' : 'housing',
      title,
      cost: parseFloat(cost) || 0,
      priceType,
      link: link,
      description: description,
      imageUrl: finalImageUrl
    });
    
    setTitle('');
    setCost('');
    setLink('');
    setDescription('');
    setImageKeyword('');
    setImagePasteUrl('');
    setPriceType('total');
    setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="w-full py-4 border-2 border-dashed border-green-300 rounded-xl text-green-600 hover:text-green-700 hover:bg-green-50 transition-all flex items-center justify-center gap-2 font-bold bg-white group"
      >
        <div className="bg-green-100 text-green-600 p-1 rounded-full group-hover:bg-green-600 group-hover:text-white transition-colors">
          <Plus className="w-5 h-5" />
        </div>
        Ajouter une {activeTab === 'activities' ? 'activité' : 'option de logement'}
      </button>
    );
  }

  return (
    <Card className="animate-fade-in border-green-500 shadow-2xl">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-lg flex items-center gap-2 text-green-900">
          <Edit2 className="w-4 h-4 text-red-500" /> Nouvelle proposition
        </h3>
        <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-red-500"><X className="w-5 h-5" /></button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs uppercase text-gray-500 font-bold mb-1">Titre</label>
          <input 
            value={title} onChange={e => setTitle(e.target.value)} required 
            placeholder={activeTab === 'activities' ? "Ex: Karting, Piscine..." : "Ex: Villa avec Piscine"}
            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-green-500 outline-none"
          />
        </div>
        <div>
          <label className="block text-xs uppercase text-gray-500 font-bold mb-1 flex items-center gap-1">
            <AlignLeft className="w-3 h-3" /> Description
          </label>
          <textarea 
            value={description} onChange={e => setDescription(e.target.value)} 
            placeholder="Détails, horaires, pourquoi c'est cool..."
            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-green-500 outline-none h-20 resize-none"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs uppercase text-gray-500 font-bold mb-1">Prix (€)</label>
            <input 
              type="number" value={cost} onChange={e => setCost(e.target.value)} required 
              placeholder="0"
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-green-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs uppercase text-gray-500 font-bold mb-1">Type de prix</label>
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                type="button"
                onClick={() => setPriceType('total')}
                className={`flex-1 text-sm py-1.5 rounded-md transition-all font-bold ${priceType === 'total' ? 'bg-white text-green-700 shadow' : 'text-gray-400 hover:text-gray-600'}`}
              >
                Total
              </button>
              <button
                type="button"
                onClick={() => setPriceType('perPerson')}
                className={`flex-1 text-sm py-1.5 rounded-md transition-all font-bold ${priceType === 'perPerson' ? 'bg-white text-green-700 shadow' : 'text-gray-400 hover:text-gray-600'}`}
              >
                / Pers
              </button>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs uppercase text-gray-500 font-bold mb-1 flex items-center gap-1">
              <ExternalLink className="w-3 h-3" /> Lien Web
            </label>
            <input 
              type="url" value={link} onChange={e => setLink(e.target.value)} 
              placeholder="https://..."
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-green-500 outline-none"
            />
          </div>
          <div className="space-y-2">
            <div>
                <label className="block text-xs uppercase text-gray-500 font-bold mb-1 flex items-center gap-1">
                <LinkIcon className="w-3 h-3" /> Image (URL directe)
                </label>
                <input 
                value={imagePasteUrl} onChange={e => setImagePasteUrl(e.target.value)} 
                placeholder="https://... (Prioritaire)"
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-green-500 outline-none"
                />
            </div>
            <div>
                <label className="block text-xs uppercase text-gray-500 font-bold mb-1 flex items-center gap-1">
                <ImageIcon className="w-3 h-3" /> OU Génération IA
                </label>
                <input 
                value={imageKeyword} onChange={e => setImageKeyword(e.target.value)} 
                placeholder="Mot clé (ex: Beer, Kart)"
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-green-500 outline-none"
                disabled={!!imagePasteUrl}
                />
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="ghost" size="sm" onClick={() => setIsOpen(false)}>Annuler</Button>
          <Button type="submit" size="sm">Ajouter</Button>
        </div>
      </form>
    </Card>
  );
};

const ItemCard = ({ item, userId, totalParticipants, onVote, onToggleValidate, onDelete, onUpdate, isAdmin }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const [editTitle, setEditTitle] = useState(item.title);
  const [editCost, setEditCost] = useState(item.cost);
  const [editDesc, setEditDesc] = useState(item.description || '');
  const [editLink, setEditLink] = useState(item.link || '');
  const [editImageKeyword, setEditImageKeyword] = useState(''); // Keep for simple edit
  const [editImageUrl, setEditImageUrl] = useState(item.imageUrl || '');

  const hasVoted = item.votes.includes(userId);
  const voteCount = item.votes.length;
  const isTrending = voteCount >= (totalParticipants / 2) && totalParticipants > 0;
  
  const displayCost = item.priceType === 'perPerson' 
    ? (item.cost * Math.max(totalParticipants, 1)) 
    : item.cost;

  const handleSave = async (e) => {
    e.stopPropagation();
    
    let finalUrl = editImageUrl;
    // Si on a un mot clé IA et pas d'URL forcée, on génère
    if (!finalUrl && editImageKeyword) {
        finalUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(editImageKeyword)}`;
    }

    const updateData = {
      title: editTitle,
      cost: parseFloat(editCost) || 0,
      description: editDesc,
      link: editLink,
      imageUrl: finalUrl
    };
    await onUpdate(item.id, updateData);
    setIsEditing(false);
    setIsFlipped(false);
  };

  const toggleFlip = (e) => {
    // Si on clique sur un bouton interactif, on ne retourne pas
    if (e.target.closest('button') || e.target.closest('input') || e.target.closest('textarea')) return;
    setIsFlipped(!isFlipped);
  };

  if (isEditing) {
    return (
      <Card className="border-green-500 ring-2 ring-green-100">
        <div className="space-y-3" onClick={e => e.stopPropagation()}>
          <h4 className="font-bold text-green-900 flex items-center gap-2"><Edit2 className="w-4 h-4"/> Modification</h4>
          <input className="w-full bg-gray-50 border border-gray-200 p-2 rounded" value={editTitle} onChange={e => setEditTitle(e.target.value)} placeholder="Titre" />
          <textarea className="w-full bg-gray-50 border border-gray-200 p-2 rounded h-20" value={editDesc} onChange={e => setEditDesc(e.target.value)} placeholder="Description" />
          <div className="flex gap-2">
            <input className="w-1/2 bg-gray-50 border border-gray-200 p-2 rounded" type="number" value={editCost} onChange={e => setEditCost(e.target.value)} placeholder="Prix" />
            <input className="w-1/2 bg-gray-50 border border-gray-200 p-2 rounded" value={editLink} onChange={e => setEditLink(e.target.value)} placeholder="Lien" />
          </div>
          <input className="w-full bg-gray-50 border border-gray-200 p-2 rounded" value={editImageUrl} onChange={e => setEditImageUrl(e.target.value)} placeholder="URL Image (Optionnel)" />
          <div className="flex justify-end gap-2 mt-2">
            <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); setIsEditing(false); }}>Annuler</Button>
            <Button size="sm" onClick={handleSave}><Save className="w-4 h-4"/> Enregistrer</Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div 
        className={`relative group bg-white rounded-xl overflow-hidden border-2 transition-all flex flex-col h-full shadow-lg cursor-pointer ${item.validated ? 'border-green-500 ring-2 ring-green-100' : 'border-gray-100'}`}
        onClick={toggleFlip}
    >
      
      {/* FACE AVANT */}
      <div className={`${isFlipped ? 'invisible' : ''} flex-1 flex flex-col`}>
          {item.imageUrl ? (
            <div className="h-40 w-full overflow-hidden relative bg-gray-100">
               <img 
                src={item.imageUrl} 
                alt={item.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                onError={(e) => {e.target.style.display='none'}}
               />
               <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            </div>
          ) : (
            <div className="h-24 bg-gradient-to-br from-green-50 to-white flex items-center justify-center border-b border-gray-100">
               <Beer className="w-8 h-8 text-green-200" />
            </div>
          )}

          {/* Validation Admin - En haut à gauche */}
          <div className="absolute top-2 left-2 z-10" onClick={e => e.stopPropagation()}>
            {isAdmin ? (
              <button 
                onClick={onToggleValidate}
                className={`w-10 h-6 rounded-full p-1 transition-colors flex items-center shadow-lg border ${item.validated ? 'bg-green-500 border-green-600 justify-end' : 'bg-gray-200 border-gray-300 justify-start'}`}
              >
                <div className="w-4 h-4 rounded-full bg-white shadow-sm" />
              </button>
            ) : (
              item.validated && <Badge type="success"><CheckCircle className="w-3 h-3 inline mr-1"/>Validé</Badge>
            )}
          </div>

          <div className="p-5 flex-1 flex flex-col">
            <div className="flex justify-between items-start mb-2 pr-2">
              <h3 className="font-bold text-lg leading-tight text-gray-800">{item.title}</h3>
            </div>
            
            <div className="flex items-baseline gap-2 mb-3">
                <span className="text-2xl font-black text-green-700">{item.cost} €</span>
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-gray-100 text-gray-500 uppercase">
                    {item.priceType === 'perPerson' ? '/ pers' : 'Total'}
                </span>
                {item.priceType === 'perPerson' && totalParticipants > 1 && (
                    <span className="text-xs text-gray-400 ml-1">
                        (Tot: {displayCost} €)
                    </span>
                )}
            </div>

            <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
              <div className="flex items-center gap-3">
                <button 
                  onClick={(e) => { e.stopPropagation(); onVote(); }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all text-sm font-bold ${
                    hasVoted 
                      ? 'bg-red-500 text-white shadow-md shadow-red-200' 
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                >
                  <ThumbsUp className={`w-4 h-4 ${hasVoted ? 'fill-current' : ''}`} />
                  {voteCount}
                </button>
                {isTrending && !item.validated && (
                  <span className="text-xs text-orange-500 font-bold flex items-center gap-1 animate-pulse">
                     🔥 Hot
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">{item.addedBy}</span>
                {(item.addedBy === userId || isAdmin) && (
                  <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="text-gray-300 hover:text-red-500 p-1 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
      </div>

      {/* Bouton Flip - En haut à droite */}
      <button 
         onClick={(e) => { e.stopPropagation(); toggleFlip(e); }}
         className="absolute top-2 right-2 z-20 bg-white/90 backdrop-blur rounded-full p-2 text-gray-600 hover:text-green-600 transition-all shadow-md hover:scale-110 border border-gray-100"
         title="Plus d'infos"
      >
         <RotateCw className="w-4 h-4" />
      </button>

      {/* FACE ARRIÈRE */}
      {isFlipped && (
        <div className="absolute inset-0 bg-white p-6 flex flex-col h-full animate-fade-in z-30">
          <div className="flex justify-between items-start mb-4 border-b border-gray-100 pb-2">
             <h3 className="font-bold text-lg text-green-800">{item.title}</h3>
             <button onClick={(e) => { e.stopPropagation(); toggleFlip(e); }} className="text-gray-400 hover:text-red-500"><X className="w-5 h-5" /></button>
          </div>
          
          <div className="flex-1 overflow-y-auto mb-4 text-sm text-gray-600 whitespace-pre-wrap leading-relaxed">
            {item.description || "Pas de description fournie."}
          </div>

          <div className="space-y-3 mt-auto" onClick={e => e.stopPropagation()}>
            {item.link && (
              <a href={item.link} target="_blank" rel="noopener noreferrer" className="block w-full py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded text-center text-sm font-bold transition-colors">
                <ExternalLink className="w-4 h-4 inline mr-2" /> Voir le lien
              </a>
            )}
            
            <button 
              onClick={(e) => { e.stopPropagation(); setIsEditing(true); }}
              className="w-full py-2 border-2 border-gray-100 hover:border-green-500 hover:text-green-600 text-gray-400 rounded text-center text-sm font-bold transition-colors flex items-center justify-center gap-2"
            >
              <Edit2 className="w-4 h-4" /> Modifier la fiche
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Application Principale ---

export default function App() {
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState(localStorage.getItem('evg_username') || '');
  const [isJoined, setIsJoined] = useState(!!localStorage.getItem('evg_username'));
  const [activeTab, setActiveTab] = useState(localStorage.getItem('evg_active_tab') || 'activities');
  const [items, setItems] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [logistics, setLogistics] = useState({ dates: [], cars: [] });
  const [settings, setSettings] = useState({ title: "EVG", date: "", accessCode: "1234" });
  const [participants, setParticipants] = useState([]); 
  const [usersInfo, setUsersInfo] = useState({}); 
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [isParticipantsLoaded, setIsParticipantsLoaded] = useState(false);

  useEffect(() => {
    localStorage.setItem('evg_active_tab', activeTab);
  }, [activeTab]);

  // Initialisation Auth
  useEffect(() => {
    const initAuth = async () => {
      try {
        await signInAnonymously(auth);
      } catch (error) {
        console.warn("Auth error", error);
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  // Chargement des données
  useEffect(() => {
    if (!user) return;

    const itemsQuery = query(collection(db, 'artifacts', appId, 'public', 'data', 'evg_items'));
    const unsubItems = onSnapshot(itemsQuery, (snapshot) => {
      const itemsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setItems(itemsData);
    });

    const expensesQuery = query(collection(db, 'artifacts', appId, 'public', 'data', 'evg_expenses'));
    const unsubExpenses = onSnapshot(expensesQuery, (snapshot) => {
      const expensesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setExpenses(expensesData);
    });

    const datesQuery = query(collection(db, 'artifacts', appId, 'public', 'data', 'evg_dates'));
    const unsubDates = onSnapshot(datesQuery, (snapshot) => {
      const datesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setLogistics(prev => ({ ...prev, dates: datesData }));
    });

    const carsQuery = query(collection(db, 'artifacts', appId, 'public', 'data', 'evg_cars'));
    const unsubCars = onSnapshot(carsQuery, (snapshot) => {
      const carsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setLogistics(prev => ({ ...prev, cars: carsData }));
    });

    const settingsRef = doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'main');
    const unsubSettings = onSnapshot(settingsRef, (docSnap) => {
      if (docSnap.exists()) {
        setSettings(docSnap.data());
      } else {
        setDoc(settingsRef, { title: "EVG Légendaire", date: "", accessCode: "1234" });
      }
    });

    const participantsRef = doc(db, 'artifacts', appId, 'public', 'data', 'participants', 'list');
    const unsubParticipants = onSnapshot(participantsRef, (docSnap) => {
      if (docSnap.exists()) {
        setParticipants(docSnap.data().names || []);
      }
      setIsParticipantsLoaded(true);
    });

    const usersInfoRef = doc(db, 'artifacts', appId, 'public', 'data', 'participants', 'details');
    const unsubUsersInfo = onSnapshot(usersInfoRef, (docSnap) => {
      if (docSnap.exists()) {
        setUsersInfo(docSnap.data());
      }
    });

    return () => {
      unsubItems();
      unsubExpenses();
      unsubSettings();
      unsubParticipants();
      unsubDates();
      unsubCars();
      unsubUsersInfo();
    };
  }, [user]);

  // Sécurité : Déconnexion forcée si le participant est supprimé
  useEffect(() => {
    if (isParticipantsLoaded && isJoined && username) {
      if (!participants.includes(username)) {
        alert("Votre profil a été supprimé de la liste des participants.");
        localStorage.removeItem('evg_username');
        setUsername('');
        setIsJoined(false);
      }
    }
  }, [isParticipantsLoaded, participants, isJoined, username]);

  // --- LOGIQUE INSCRIPTION ET PROFIL ---

  const handleJoin = async (rawName, code, personalPin) => {
    if (!rawName.trim()) return;
    
    // 1. Formatage du nom (Seb, pas seb)
    const name = formatName(rawName);

    // 2. Vérification si l'utilisateur existe déjà
    const userDetails = usersInfo[name];

    if (userDetails) {
      // UTILISATEUR EXISTANT
      // On demande le PIN perso au lieu du code général
      if (!userDetails.pin) {
          // Cas rare : Ancien user sans PIN (on le laisse passer ou on demande d'en créer un ?)
          // Pour la sécu, on demande le code général ici exceptionnellement
          if (code !== (settings.accessCode || "1234")) {
             alert("Code général incorrect !");
             return;
          }
      } else {
          // User a un PIN : On vérifie le PIN donné OU on demande
          let pinToCheck = personalPin;
          if (!pinToCheck) {
             pinToCheck = prompt(`Salut ${name} ! Entre ton Code PIN Perso :`);
          }
          
          if (pinToCheck !== userDetails.pin) {
             alert("Code PIN personnel incorrect !");
             return;
          }
      }
    } else {
      // NOUVEL UTILISATEUR
      // 1. Vérif Code Général
      if (code !== (settings.accessCode || "1234")) {
        alert("Code d'accès général incorrect !");
        return;
      }
      // 2. Vérif PIN Perso Obligatoire
      if (!personalPin || personalPin.length < 3) {
        alert("Tu dois choisir un Code PIN personnel (min 3 chiffres) !");
        return;
      }
    }

    // 3. Connexion
    localStorage.setItem('evg_username', name);
    setUsername(name);
    setIsJoined(true);
    
    // Si c'est un nouveau, on l'ajoute
    if (!participants.includes(name)) {
      const newParticipants = [...participants, name];
      const ref = doc(db, 'artifacts', appId, 'public', 'data', 'participants', 'list');
      await setDoc(ref, { names: newParticipants }, { merge: true });
    }

    // Mise à jour du PIN perso si fourni (Création ou Mise à jour)
    if (personalPin) {
        const detailsRef = doc(db, 'artifacts', appId, 'public', 'data', 'participants', 'details');
        await setDoc(detailsRef, { [name]: { pin: personalPin } }, { merge: true });
    }
  };

  const handleLogout = () => {
    if (confirm("Se déconnecter ?")) {
      localStorage.removeItem('evg_username');
      setUsername('');
      setIsJoined(false);
    }
  };

  const handleRenameUser = async (newName, newPin) => {
    if(!newName.trim()) return;
    const formattedNewName = formatName(newName);
    
    if (participants.includes(formattedNewName) && formattedNewName !== username) {
      alert("Ce nom est déjà pris !");
      return;
    }

    const newParticipants = participants.map(p => p === username ? formattedNewName : p);
    const listRef = doc(db, 'artifacts', appId, 'public', 'data', 'participants', 'list');
    await setDoc(listRef, { names: newParticipants }, { merge: true });

    const detailsRef = doc(db, 'artifacts', appId, 'public', 'data', 'participants', 'details');
    await setDoc(detailsRef, { 
      [formattedNewName]: { pin: newPin || (usersInfo[username]?.pin || "") } 
    }, { merge: true });

    localStorage.setItem('evg_username', formattedNewName);
    setUsername(formattedNewName);
    setShowEditProfile(false);
  };

  const handleAddParticipantByAdmin = async (name) => {
    if (!name.trim()) return;
    const formatted = formatName(name);
    if (!participants.includes(formatted)) {
      const newParticipants = [...participants, formatted];
      const ref = doc(db, 'artifacts', appId, 'public', 'data', 'participants', 'list');
      await setDoc(ref, { names: newParticipants }, { merge: true });
    }
  };

  const handleRemoveParticipant = async (nameToRemove) => {
    if (!confirm(`Supprimer ${nameToRemove} de la liste ?\nAttention : Ses données de connexion (PIN) seront effacées.`)) return;
    
    // 1. Update List
    const newParticipants = participants.filter(p => p !== nameToRemove);
    const listRef = doc(db, 'artifacts', appId, 'public', 'data', 'participants', 'list');
    await setDoc(listRef, { names: newParticipants }, { merge: true });

    // 2. Clear PIN/Details (Reset Registration)
    const detailsRef = doc(db, 'artifacts', appId, 'public', 'data', 'participants', 'details');
    await updateDoc(detailsRef, {
        [nameToRemove]: deleteField()
    });
  };

  const handleAddItem = async (itemData) => {
    await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'evg_items'), {
      ...itemData,
      votes: [],
      validated: false,
      addedBy: username,
      createdAt: Date.now()
    });
  };

  const handleUpdateItem = async (itemId, updatedData) => {
    await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'evg_items', itemId), updatedData);
  };

  const handleAddExpense = async (expenseData) => {
    await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'evg_expenses'), {
      ...expenseData,
      addedBy: username,
      createdAt: Date.now()
    });
  };

  const handleVote = async (item) => {
    const hasVoted = item.votes.includes(username);
    let newVotes;
    if (hasVoted) {
      newVotes = item.votes.filter(v => v !== username);
    } else {
      newVotes = [...item.votes, username];
    }
    await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'evg_items', item.id), {
      votes: newVotes
    });
  };

  const handleAddDate = async (startDate, endDate) => {
    await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'evg_dates'), {
      date: startDate,
      endDate: endDate || startDate,
      votes: [],
      addedBy: username
    });
  };

  const handleVoteDate = async (dateItem) => {
    const hasVoted = dateItem.votes.includes(username);
    let newVotes;
    if (hasVoted) {
      newVotes = dateItem.votes.filter(v => v !== username);
    } else {
      newVotes = [...dateItem.votes, username];
    }
    await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'evg_dates', dateItem.id), {
      votes: newVotes
    });
  };

  const handleAddCar = async (carData) => {
    await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'evg_cars'), {
      ...carData,
      addedBy: username
    });
  };

  const handleDeleteLogistics = async (collectionName, id) => {
    if (!confirm("Supprimer ?")) return;
    await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', collectionName, id));
  };

  const handleToggleValidate = async (item) => {
    if (!isAdminMode) return;
    await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'evg_items', item.id), {
      validated: !item.validated
    });
  };

  const handleDelete = async (itemId) => {
    if (!confirm("Supprimer cet élément ?")) return;
    await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'evg_items', itemId));
  };
  
  const handleDeleteExpense = async (expenseId) => {
    if (!confirm("Supprimer cette dépense ?")) return;
    await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'evg_expenses', expenseId));
  };

  const handleUpdateSettings = async (newData) => {
    await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'main'), {
      ...settings,
      ...newData
    }, { merge: true });
  };

  const budget = useMemo(() => {
    const activities = items.filter(i => i.type === 'activity');
    const housing = items.filter(i => i.type === 'housing');
    
    // Sort housings by votes desc
    const sortedHousing = [...housing].sort((a, b) => b.votes.length - a.votes.length);
    const topHousing = sortedHousing[0];
    const userCount = Math.max(participants.length, 1);

    const calculateItemCost = (item) => {
      const baseCost = parseFloat(item.cost) || 0;
      if (item.priceType === 'perPerson') {
        return baseCost * userCount;
      }
      return baseCost;
    };

    // ACTIVITIES
    const activitiesValidated = activities.filter(i => i.validated).reduce((acc, curr) => acc + calculateItemCost(curr), 0);
    const activitiesTrending = activities.filter(i => i.validated || (i.votes.length >= userCount / 2)).reduce((acc, curr) => acc + calculateItemCost(curr), 0);
    const activitiesTotal = activities.reduce((acc, curr) => acc + calculateItemCost(curr), 0);

    // HOUSING (Special Logic: Only ONE housing counts)
    // 1. Validated: Sum of Validated Housing(s). If multiple validated, sum them (Admin choice). If none, 0.
    const housingValidated = housing.filter(i => i.validated).reduce((acc, curr) => acc + calculateItemCost(curr), 0);
    
    // 2. Trending: Cost of the TOP VOTED housing only.
    const housingTrending = topHousing ? calculateItemCost(topHousing) : 0;

    // 3. Total: Cost of the TOP VOTED housing only (Assumption: we sleep in one place).
    const housingTotal = topHousing ? calculateItemCost(topHousing) : 0;

    return { 
        validated: activitiesValidated + housingValidated, 
        trending: activitiesTrending + housingTrending, 
        total: activitiesTotal + housingTotal, 
        userCount 
    };
  }, [items, participants]);

  const balance = useMemo(() => {
    if (participants.length === 0) return { balances: {}, debts: [] };
    const balances = {};
    participants.forEach(p => balances[p] = 0);
    let totalSpent = 0;

    expenses.forEach(exp => {
      const amount = parseFloat(exp.amount) || 0;
      const payer = exp.payer;
      totalSpent += amount;
      if (payer === 'Tous') return;
      if (balances[payer] !== undefined) balances[payer] += amount;
      const share = amount / Math.max(participants.length, 1);
      participants.forEach(p => { balances[p] -= share; });
    });

    const debts = [];
    const debtors = Object.entries(balances).filter(([, bal]) => bal < -0.01).sort((a, b) => a[1] - b[1]); 
    const creditors = Object.entries(balances).filter(([, bal]) => bal > 0.01).sort((a, b) => b[1] - a[1]); 

    let i = 0; let j = 0;
    while (i < debtors.length && j < creditors.length) {
      const debtor = debtors[i];
      const creditor = creditors[j];
      const debtAmount = Math.min(Math.abs(debtor[1]), creditor[1]);
      debts.push({ from: debtor[0], to: creditor[0], amount: debtAmount });
      debtor[1] += debtAmount; creditor[1] -= debtAmount;
      if (Math.abs(debtor[1]) < 0.01) i++;
      if (creditor[1] < 0.01) j++;
    }
    return { balances, debts, totalSpent };
  }, [expenses, participants]);

  if (!user) return <div className="min-h-screen bg-green-50 flex items-center justify-center text-green-800">Chargement de la Féria...</div>;
  
  if (!isJoined) {
    return (
      <div className="min-h-screen bg-green-50 flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-2xl border-4 border-green-600">
          <div className="text-center mb-8">
            <div className="inline-block p-4 rounded-full bg-red-100 mb-4 border-2 border-red-200">
                <Beer className="w-12 h-12 text-red-600" />
            </div>
            <h1 className="text-3xl font-black mb-2 text-green-900 uppercase tracking-wider">{settings.title}</h1>
            <p className="text-gray-500 font-medium">L'application officielle.</p>
          </div>
          <form onSubmit={(e) => { e.preventDefault(); handleJoin(e.target.name.value, e.target.code.value, e.target.pin.value); }} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Ton Prénom</label>
              <input 
                name="name"
                type="text" 
                required
                className="w-full bg-gray-50 border-2 border-gray-200 rounded-lg px-4 py-3 text-gray-900 focus:ring-2 focus:ring-green-500 outline-none font-bold"
                placeholder="Ex: Thomas"
              />
            </div>
            <div className="flex gap-2">
                <div className="flex-1">
                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Code Général</label>
                    <input 
                        name="code"
                        type="tel" 
                        className="w-full bg-gray-50 border-2 border-gray-200 rounded-lg px-4 py-3 text-gray-900 focus:ring-2 focus:ring-green-500 outline-none text-center tracking-widest font-bold"
                        placeholder="1234"
                    />
                </div>
                <div className="flex-1">
                    <label className="block text-xs font-bold text-red-600 mb-1 uppercase">Ton PIN (Perso)</label>
                    <input 
                        name="pin"
                        type="tel" 
                        required
                        className="w-full bg-white border-2 border-red-200 rounded-lg px-4 py-3 text-gray-900 focus:ring-2 focus:ring-red-500 outline-none text-center tracking-widest font-bold placeholder-red-200"
                        placeholder="0000"
                    />
                </div>
            </div>
            <Button className="w-full bg-red-600 hover:bg-red-700 text-white" type="submit" size="md">Entrer dans l'arène</Button>
          </form>
        </div>
      </div>
    );
  }

  const TabButton = ({ id, icon: Icon, label }) => (
    <button
      onClick={() => { setActiveTab(id); setShowMobileMenu(false); }}
      className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all w-full md:w-auto border-2 ${
        activeTab === id 
          ? 'bg-red-600 border-red-700 text-white font-bold shadow-lg transform scale-105' 
          : 'bg-white border-green-100 text-green-800 hover:bg-green-50'
      }`}
    >
      <Icon className="w-4 h-4" />
      <span>{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-green-50 text-gray-800 font-sans pb-32 md:pb-0">
      
      {/* Header */}
      <header className="bg-white border-b-4 border-green-600 sticky top-0 z-40 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-red-600 p-2 rounded-lg shadow-md transform -rotate-3">
              <Beer className="w-6 h-6 text-white" />
            </div>
            {isAdminMode ? (
              <div className="flex flex-col gap-1">
                <input 
                  type="text" 
                  value={settings.title}
                  onChange={(e) => handleUpdateSettings({ title: e.target.value })}
                  className="bg-gray-100 border border-gray-300 rounded px-2 py-1 text-lg font-black text-green-900 w-48 focus:ring-2 focus:ring-green-500"
                />
                <div className="flex items-center gap-1">
                  <KeyRound className="w-3 h-3 text-gray-400" />
                  <input 
                    type="text" 
                    value={settings.accessCode || "1234"}
                    onChange={(e) => handleUpdateSettings({ accessCode: e.target.value })}
                    className="bg-gray-100 border border-gray-300 rounded px-1 py-0.5 text-xs text-gray-600 w-20"
                    placeholder="Code d'accès"
                  />
                </div>
              </div>
            ) : (
              <h1 className="text-xl font-black text-green-900 uppercase tracking-tighter">{settings.title}</h1>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsAdminMode(!isAdminMode)}
              className={`p-2 rounded-lg transition-colors ${isAdminMode ? 'bg-green-100 text-green-800' : 'text-gray-400 hover:text-green-600'}`}
            >
              {isAdminMode ? <Unlock className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
            </button>
            <button 
              onClick={handleLogout}
              className="p-2 rounded-lg text-gray-400 hover:text-red-500 transition-colors"
            >
              <LogOut className="w-5 h-5" />
            </button>
            <div className="hidden md:flex bg-green-100 px-3 py-1.5 rounded-full text-sm font-bold text-green-800 border border-green-200">
              {username}
            </div>
          </div>
        </div>

        {/* Navigation Desktop */}
        <div className="hidden md:block border-t border-gray-100 bg-white/50 backdrop-blur">
          <div className="max-w-6xl mx-auto px-4 flex gap-2 py-3 overflow-x-auto">
            <TabButton id="activities" icon={Beer} label="Activités" />
            <TabButton id="housing" icon={Home} label="Logement" />
            <TabButton id="budget" icon={Wallet} label="Budget" />
            <TabButton id="logistics" icon={Calendar} label="Logistique" />
            <TabButton id="balance" icon={Scale} label="Comptes" />
            <TabButton id="participants" icon={Users} label="Potes" />
          </div>
        </div>
      </header>

      {/* Navigation Mobile */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t-4 border-red-500 z-50 px-1 py-2 flex justify-between items-center safe-area-pb text-[9px] sm:text-xs shadow-[0_-5px_20px_rgba(0,0,0,0.1)]">
        <button onClick={() => setActiveTab('activities')} className={`flex flex-col items-center p-2 rounded-lg flex-1 ${activeTab === 'activities' ? 'text-red-600 font-bold' : 'text-gray-400'}`}>
          <Beer className="w-6 h-6 mb-1" /> Activités
        </button>
        <button onClick={() => setActiveTab('housing')} className={`flex flex-col items-center p-2 rounded-lg flex-1 ${activeTab === 'housing' ? 'text-red-600 font-bold' : 'text-gray-400'}`}>
          <Home className="w-6 h-6 mb-1" /> Logement
        </button>
        <button onClick={() => setActiveTab('budget')} className={`flex flex-col items-center p-2 rounded-lg flex-1 ${activeTab === 'budget' ? 'text-red-600 font-bold' : 'text-gray-400'}`}>
          <Wallet className="w-6 h-6 mb-1" /> Budget
        </button>
        <button onClick={() => setActiveTab('logistics')} className={`flex flex-col items-center p-2 rounded-lg flex-1 ${activeTab === 'logistics' ? 'text-red-600 font-bold' : 'text-gray-400'}`}>
          <Calendar className="w-6 h-6 mb-1" /> Logist.
        </button>
        <button onClick={() => setActiveTab('balance')} className={`flex flex-col items-center p-2 rounded-lg flex-1 ${activeTab === 'balance' ? 'text-red-600 font-bold' : 'text-gray-400'}`}>
          <Scale className="w-6 h-6 mb-1" /> Comptes
        </button>
        <button onClick={() => setActiveTab('participants')} className={`flex flex-col items-center p-2 rounded-lg flex-1 ${activeTab === 'participants' ? 'text-red-600 font-bold' : 'text-gray-400'}`}>
          <Users className="w-6 h-6 mb-1" /> Potes
        </button>
      </div>

      <main className="max-w-6xl mx-auto p-4 md:py-8">
        
        {(activeTab === 'activities' || activeTab === 'housing') && (
          <div className="space-y-6">
            <AddItemForm 
              type={activeTab === 'activity' ? 'activity' : (activeTab === 'housing' ? 'housing' : 'activity')} 
              onAdd={handleAddItem} 
              activeTab={activeTab}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.filter(i => i.type === (activeTab === 'activities' ? 'activity' : 'housing')).map(item => (
                <ItemCard 
                  key={item.id} 
                  item={item} 
                  userId={username}
                  totalParticipants={participants.length}
                  onVote={() => handleVote(item)}
                  onToggleValidate={() => handleToggleValidate(item)}
                  onDelete={() => handleDelete(item.id)}
                  onUpdate={handleUpdateItem}
                  isAdmin={isAdminMode}
                />
              ))}
              
              {items.filter(i => i.type === (activeTab === 'activities' ? 'activity' : 'housing')).length === 0 && (
                <div className="col-span-full py-12 text-center text-gray-400 bg-white rounded-xl border-2 border-dashed border-gray-200">
                  <p className="text-lg font-bold">C'est vide ici !</p>
                  <p className="text-sm">Propose un truc sympa.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Vue Logistique */}
        {activeTab === 'logistics' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h2 className="text-xl font-black text-green-900 flex items-center gap-2 uppercase tracking-wide"><Calendar className="w-6 h-6 text-red-500"/> Sondage Dates</h2>
              
              <Card>
                 <form onSubmit={(e) => {
                   e.preventDefault();
                   if(e.target.dateStart.value) {
                     handleAddDate(e.target.dateStart.value, e.target.dateEnd.value);
                     e.target.dateStart.value = '';
                     e.target.dateEnd.value = '';
                   }
                 }} className="flex gap-2 mb-4 items-center">
                   <div className="flex-1 flex gap-2">
                        <input name="dateStart" type="date" className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-2 py-2 text-gray-900 text-xs" required />
                        <span className="text-gray-400 self-center">au</span>
                        <input name="dateEnd" type="date" className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-2 py-2 text-gray-900 text-xs" />
                   </div>
                   <Button size="sm" type="submit"><Plus className="w-4 h-4"/></Button>
                 </form>

                 <div className="space-y-2">
                   {logistics.dates.sort((a,b) => new Date(a.date) - new Date(b.date)).map(dateItem => {
                     const votes = dateItem.votes || [];
                     const hasVoted = votes.includes(username);
                     return (
                       <div key={dateItem.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-green-100">
                         <div className="flex flex-col">
                            <span className="font-bold text-green-900">{formatDateRange(dateItem.date, dateItem.endDate)}</span>
                            <span className="text-xs text-gray-500 font-bold">{votes.length} votes</span>
                         </div>
                         <div className="flex items-center gap-2">
                           <button 
                             onClick={() => handleVoteDate(dateItem)}
                             className={`p-2 rounded-lg transition-all ${hasVoted ? 'bg-red-500 text-white shadow-md' : 'bg-white text-gray-400 border border-gray-200 hover:border-red-300'}`}
                           >
                             <ThumbsUp className="w-4 h-4" />
                           </button>
                           {(dateItem.addedBy === username || isAdminMode) && (
                             <button onClick={() => handleDeleteLogistics('evg_dates', dateItem.id)} className="text-gray-400 hover:text-red-500">
                               <Trash2 className="w-4 h-4" />
                             </button>
                           )}
                         </div>
                       </div>
                     )
                   })}
                 </div>
              </Card>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-black text-green-900 flex items-center gap-2 uppercase tracking-wide"><Car className="w-6 h-6 text-red-500"/> Voitures</h2>
              
              <Card>
                 <form onSubmit={(e) => {
                   e.preventDefault();
                   if(e.target.driver.value && e.target.seats.value) {
                     handleAddCar({
                       driver: e.target.driver.value,
                       seats: parseInt(e.target.seats.value)
                     });
                     e.target.driver.value = '';
                     e.target.seats.value = '';
                   }
                 }} className="flex gap-2 mb-4">
                   <input name="driver" placeholder="Conducteur" className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-900" required />
                   <input name="seats" type="number" placeholder="Places" className="w-20 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-900" required />
                   <Button size="sm" type="submit"><Plus className="w-4 h-4"/></Button>
                 </form>

                 <div className="space-y-2">
                   {logistics.cars.map(car => (
                     <div key={car.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-green-100">
                       <div className="flex items-center gap-3">
                          <Car className="w-5 h-5 text-green-600"/>
                          <div>
                            <div className="font-bold text-green-900">{car.driver}</div>
                            <div className="text-xs text-gray-500 font-bold">{car.seats} places dispo</div>
                          </div>
                       </div>
                       {(car.addedBy === username || isAdminMode) && (
                         <button onClick={() => handleDeleteLogistics('evg_cars', car.id)} className="text-gray-400 hover:text-red-500">
                           <Trash2 className="w-4 h-4" />
                         </button>
                       )}
                     </div>
                   ))}
                 </div>
              </Card>
            </div>
          </div>
        )}

        {/* Vue Budget */}
        {activeTab === 'budget' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <BudgetCard 
                title="Budget Validé" 
                amount={budget.validated} 
                icon={CheckCircle}
                color="text-green-600"
                desc="Le coût réel du weekend"
              />
              <BudgetCard 
                title="Budget Tendance" 
                amount={budget.trending} 
                icon={ThumbsUp}
                color="text-orange-500"
                desc="Ce qui plaît à la majorité"
              />
              <BudgetCard 
                title="Budget Total" 
                amount={budget.total} 
                icon={Wallet}
                color="text-blue-500"
                desc="Si on craque le PEL"
              />
            </div>

            <Card>
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-green-900">
                <Calculator className="w-5 h-5 text-green-600" />
                Détail par tête ({budget.userCount})
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200 text-gray-400 text-xs uppercase tracking-wider">
                      <th className="py-2 pl-2">Scénario</th>
                      <th className="py-2 text-right">Total</th>
                      <th className="py-2 text-right pr-2">Par Pers.</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-800 text-sm font-medium">
                    <tr className="border-b border-gray-100">
                      <td className="py-3 pl-2 text-green-600 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" /> Validé
                      </td>
                      <td className="py-3 text-right">{budget.validated.toFixed(0)} €</td>
                      <td className="py-3 text-right pr-2 font-bold text-green-700">{(budget.validated / budget.userCount).toFixed(2)} €</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-3 pl-2 text-orange-500 flex items-center gap-2">
                        <ThumbsUp className="w-4 h-4" /> Tendance
                      </td>
                      <td className="py-3 text-right">{budget.trending.toFixed(0)} €</td>
                      <td className="py-3 text-right pr-2 font-bold text-orange-600">{(budget.trending / budget.userCount).toFixed(2)} €</td>
                    </tr>
                    <tr>
                      <td className="py-3 pl-2 text-blue-500 flex items-center gap-2">
                        <Wallet className="w-4 h-4" /> Max
                      </td>
                      <td className="py-3 text-right">{budget.total.toFixed(0)} €</td>
                      <td className="py-3 text-right pr-2 font-bold text-blue-600">{(budget.total / budget.userCount).toFixed(2)} €</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* Vue Comptes / Balance */}
        {activeTab === 'balance' && (
          <div className="space-y-6">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <Card className="bg-green-800 border-none text-white shadow-lg shadow-green-900/20">
                 <h3 className="text-green-200 uppercase text-xs font-bold mb-2 flex items-center gap-2"><Euro className="w-4 h-4" /> Total Dépensé</h3>
                 <div className="text-4xl font-black">{balance.totalSpent.toFixed(0)} €</div>
                 <div className="text-sm text-green-100 mt-1">
                    Soit <strong className="text-white">{(balance.totalSpent / Math.max(participants.length, 1)).toFixed(2)} €</strong> / personne
                 </div>
               </Card>

               <Card>
                 <h3 className="text-gray-400 uppercase text-xs font-bold mb-4 flex items-center gap-2"><Scale className="w-4 h-4" /> Équilibre</h3>
                 <div className="space-y-2 max-h-40 overflow-y-auto">
                   {participants.map(p => {
                     const bal = balance.balances[p] || 0;
                     return (
                       <div key={p} className="flex justify-between items-center text-sm font-medium">
                         <span>{p}</span>
                         <span className={`font-mono font-bold ${bal > 0 ? 'text-green-600' : (bal < 0 ? 'text-red-500' : 'text-gray-400')}`}>
                           {bal > 0 ? '+' : ''}{bal.toFixed(2)} €
                         </span>
                       </div>
                     );
                   })}
                 </div>
               </Card>
             </div>

             {balance.debts.length > 0 && (
               <Card className="border-red-100 bg-red-50/50">
                 <h3 className="text-red-500 font-bold mb-4 flex items-center gap-2 text-sm uppercase">
                   <ArrowRight className="w-5 h-5" /> Remboursements
                 </h3>
                 <div className="grid gap-2">
                   {balance.debts.map((debt, idx) => (
                     <div key={idx} className="bg-white p-3 rounded-lg flex items-center justify-between border border-red-100 shadow-sm">
                       <div className="flex items-center gap-2 text-sm">
                         <span className="font-bold text-gray-800">{debt.from}</span>
                         <span className="text-gray-400 px-1">➜</span>
                         <span className="font-bold text-gray-800">{debt.to}</span>
                       </div>
                       <span className="font-mono font-bold text-red-600 bg-red-50 px-2 py-1 rounded">
                         {debt.amount.toFixed(2)} €
                       </span>
                     </div>
                   ))}
                 </div>
               </Card>
             )}

             <div className="bg-green-100/50 border border-green-200 rounded-xl p-4">
               <h3 className="font-bold text-green-800 mb-3 text-sm uppercase">Activités validées à régler</h3>
               <div className="space-y-2">
                 {items.filter(i => i.validated && !expenses.some(e => e.relatedItemId === i.id)).map(item => {
                    const amount = item.priceType === 'perPerson' ? (item.cost * participants.length) : item.cost;
                    return (
                     <div key={item.id} className="bg-white p-3 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-green-100 shadow-sm">
                       <div>
                         <div className="font-bold text-green-900">{item.title}</div>
                         <div className="text-xs text-gray-500">{amount} € ({item.priceType === 'perPerson' ? 'par tête calculé' : 'total'})</div>
                       </div>
                       <div className="flex items-center gap-2">
                         <select 
                           className="bg-gray-50 border border-gray-200 text-sm rounded px-2 py-1.5 outline-none focus:ring-1 focus:ring-green-500"
                           onChange={(e) => {
                             if(e.target.value) {
                               handleAddExpense({
                                 title: item.title,
                                 amount: amount,
                                 payer: e.target.value,
                                 relatedItemId: item.id
                               });
                             }
                           }}
                           value=""
                         >
                           <option value="">Qui a payé ?</option>
                           <option value="Tous">Tous (Chacun sa part)</option>
                           {participants.map(p => <option key={p} value={p}>{p}</option>)}
                         </select>
                       </div>
                     </div>
                   );
                 })}
                 {items.filter(i => i.validated && !expenses.some(e => e.relatedItemId === i.id)).length === 0 && (
                   <div className="text-green-600 text-sm italic text-center py-2">Tout est à jour chef !</div>
                 )}
               </div>
             </div>

             <AddExpenseForm participants={participants} onAdd={handleAddExpense} />

             <div className="space-y-2">
               <h3 className="font-bold text-gray-400 text-sm uppercase mb-2">Historique</h3>
               {expenses.sort((a,b) => b.createdAt - a.createdAt).map(exp => (
                 <div key={exp.id} className="bg-white border border-gray-100 p-3 rounded-lg flex items-center justify-between shadow-sm">
                   <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${exp.payer === 'Tous' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-700'}`}>
                        {exp.payer === 'Tous' ? 'TS' : exp.payer.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-gray-800 text-sm">{exp.title}</div>
                        <div className="text-xs text-gray-400">{exp.payer === 'Tous' ? 'Payé par chacun' : `Avancé par ${exp.payer}`}</div>
                      </div>
                   </div>
                   <div className="flex items-center gap-3">
                     <span className="font-mono font-bold text-gray-800">{exp.amount} €</span>
                     {(exp.addedBy === username || isAdminMode) && (
                       <button onClick={() => handleDeleteExpense(exp.id)} className="text-gray-300 hover:text-red-500">
                         <Trash2 className="w-4 h-4" />
                       </button>
                     )}
                   </div>
                 </div>
               ))}
             </div>
          </div>
        )}

        {/* Vue Participants */}
        {activeTab === 'participants' && (
          <div className="max-w-2xl mx-auto space-y-6">
             <Card>
               <div className="flex justify-between items-center mb-6">
                 <h3 className="text-xl font-black text-green-900 flex items-center gap-2 uppercase">
                   <Users className="w-6 h-6 text-red-500" />
                   La Team ({participants.length})
                 </h3>
                 <button 
                    onClick={() => setShowEditProfile(!showEditProfile)}
                    className="text-xs font-bold text-green-600 hover:text-green-800 flex items-center gap-1 border border-green-200 px-2 py-1 rounded-lg bg-green-50"
                 >
                    <UserCog className="w-4 h-4" /> Modifier mon profil
                 </button>
               </div>

               {showEditProfile && (
                 <div className="mb-6 bg-green-50 p-4 rounded-xl border border-green-200 animate-fade-in">
                    <h4 className="font-bold text-green-900 mb-2">Modifier mes infos</h4>
                    <form onSubmit={(e) => {
                        e.preventDefault();
                        handleRenameUser(e.target.newName.value, e.target.newPin.value);
                    }} className="space-y-3">
                        <input name="newName" defaultValue={username} placeholder="Nouveau nom" className="w-full p-2 rounded border border-gray-300" />
                        <input name="newPin" placeholder="Nouveau Code PIN (Optionnel)" className="w-full p-2 rounded border border-gray-300" type="tel" />
                        <div className="flex gap-2 justify-end">
                            <Button size="sm" variant="ghost" onClick={() => setShowEditProfile(false)}>Annuler</Button>
                            <Button size="sm" type="submit">Enregistrer</Button>
                        </div>
                    </form>
                 </div>
               )}
               
               {isAdminMode && (
                 <form onSubmit={(e) => {
                   e.preventDefault();
                   handleAddParticipantByAdmin(e.target.name.value);
                   e.target.name.value = '';
                 }} className="mb-4 flex gap-2">
                   <input 
                     name="name" 
                     placeholder="Ajouter un pote..." 
                     className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-900 text-sm focus:ring-2 focus:ring-green-500"
                   />
                   <Button size="sm" type="submit"><Plus className="w-4 h-4" /> Ajout</Button>
                 </form>
               )}

               <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                 {participants.map((p, idx) => (
                   <div key={idx} className="flex items-center gap-3 bg-white p-3 rounded-lg border border-gray-100 shadow-sm justify-between">
                     <div className="flex items-center gap-3">
                       <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center text-lg font-bold text-white shadow-md">
                         {p.charAt(0).toUpperCase()}
                       </div>
                       <span className="font-bold text-gray-700">{p}</span>
                       {p === username && <span className="ml-auto text-[10px] font-bold bg-green-100 text-green-700 px-2 py-1 rounded-full">MOI</span>}
                     </div>
                     {isAdminMode && (
                       <button onClick={() => handleRemoveParticipant(p)} className="text-gray-300 hover:text-red-500 transition-colors p-2">
                         <X className="w-4 h-4" />
                       </button>
                     )}
                   </div>
                 ))}
               </div>
             </Card>
          </div>
        )}

      </main>
    </div>
  );
}
