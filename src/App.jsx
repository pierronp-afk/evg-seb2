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
  query 
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
  KeyRound
} from 'lucide-react';

// --- Configuration Firebase ---
// NOTE POUR LA MISE EN LIGNE : Remplacez les lignes ci-dessous par votre propre configuration Firebase
// Si __firebase_config n'est pas défini (local), utilisez une config vide ou par défaut pour éviter le crash immédiat
const firebaseConfig = {
  apiKey: "AIzaSyDPkr06UgZa-EiveZrLzKkDbOOVB5AuYJU",
  authDomain: "evg-seb.firebaseapp.com",
  projectId: "evg-seb",
  storageBucket: "evg-seb.firebasestorage.app",
  messagingSenderId: "758953125301",
  appId: "1:758953125301:web:103e85e7a9744b8b54e5fc"
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

// --- Composants UI de Base ---

const Button = ({ children, onClick, variant = 'primary', className = '', size = 'md', disabled = false, type="button" }) => {
  const baseStyle = "font-bold rounded-lg transition-all duration-200 flex items-center justify-center gap-2";
  const variants = {
    primary: "bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/30",
    secondary: "bg-gray-700 hover:bg-gray-600 text-white",
    danger: "bg-red-500/10 hover:bg-red-500/20 text-red-500",
    success: "bg-green-500 hover:bg-green-600 text-white",
    ghost: "bg-transparent hover:bg-white/5 text-gray-400 hover:text-white"
  };
  const sizes = {
    sm: "px-3 py-1.5 text-sm",
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
  <div className={`bg-gray-800 border border-gray-700 rounded-xl p-4 shadow-xl ${className}`}>
    {children}
  </div>
);

const Badge = ({ children, type = 'neutral' }) => {
  const types = {
    neutral: "bg-gray-700 text-gray-300",
    success: "bg-green-500/20 text-green-400 border border-green-500/30",
    warning: "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30",
    info: "bg-blue-500/20 text-blue-400 border border-blue-500/30",
    purple: "bg-purple-500/20 text-purple-400 border border-purple-500/30"
  };
  return (
    <span className={`px-2 py-1 rounded-md text-xs font-medium border ${types[type]}`}>
      {children}
    </span>
  );
};

const BudgetCard = ({ title, amount, icon: Icon, color, desc }) => (
  <Card className="relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
    <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity ${color}`}>
      <Icon className="w-24 h-24 transform translate-x-4 -translate-y-4" />
    </div>
    <div className="relative z-10">
      <div className={`flex items-center gap-2 mb-2 ${color}`}>
        <Icon className="w-5 h-5" />
        <span className="font-bold uppercase text-sm tracking-wider">{title}</span>
      </div>
      <div className="text-4xl font-black text-white mb-1">
        {amount.toFixed(0)} <span className="text-lg text-gray-500 font-medium">€</span>
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
        className="w-full py-4 border-2 border-dashed border-gray-700 rounded-xl text-gray-400 hover:text-indigo-400 hover:border-indigo-500/50 hover:bg-gray-800/50 transition-all flex items-center justify-center gap-2 font-medium"
      >
        <Plus className="w-5 h-5" /> Ajouter une dépense manuelle
      </button>
    );
  }

  return (
    <Card className="animate-fade-in bg-gray-800 border-indigo-500/30">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-lg">Nouvelle dépense</h3>
        <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs uppercase text-gray-500 font-bold mb-1">Quoi ?</label>
          <input 
            value={title} onChange={e => setTitle(e.target.value)} required 
            placeholder="Ex: Courses Carrefour, Essence..."
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 focus:ring-1 focus:ring-indigo-500 outline-none"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs uppercase text-gray-500 font-bold mb-1">Combien ?</label>
            <input 
              type="number" value={amount} onChange={e => setAmount(e.target.value)} required 
              placeholder="0"
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 focus:ring-1 focus:ring-indigo-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs uppercase text-gray-500 font-bold mb-1">Qui a payé ?</label>
            <select 
              value={payer} onChange={e => setPayer(e.target.value)} required
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 focus:ring-1 focus:ring-indigo-500 outline-none"
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
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd({
      type: activeTab === 'activities' ? 'activity' : 'housing',
      title,
      cost: parseFloat(cost) || 0,
      priceType,
      link: link,
      description: description,
      imageUrl: imageKeyword 
        ? `https://image.pollinations.ai/prompt/${encodeURIComponent(imageKeyword)}`
        : null
    });
    setTitle('');
    setCost('');
    setLink('');
    setDescription('');
    setImageKeyword('');
    setPriceType('total');
    setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="w-full py-4 border-2 border-dashed border-gray-700 rounded-xl text-gray-400 hover:text-indigo-400 hover:border-indigo-500/50 hover:bg-gray-800/50 transition-all flex items-center justify-center gap-2 font-medium group"
      >
        <div className="bg-gray-700 p-1 rounded-full group-hover:bg-indigo-500 group-hover:text-white transition-colors">
          <Plus className="w-5 h-5" />
        </div>
        Ajouter une {activeTab === 'activities' ? 'activité' : 'option de logement'}
      </button>
    );
  }

  return (
    <Card className="animate-fade-in bg-gray-800/90 backdrop-blur border-indigo-500/30 shadow-2xl shadow-black/50">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-lg flex items-center gap-2">
          <Edit2 className="w-4 h-4 text-indigo-400" /> Nouvelle proposition
        </h3>
        <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white bg-gray-700/50 p-1 rounded-full"><X className="w-5 h-5" /></button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs uppercase text-gray-500 font-bold mb-1">Titre</label>
          <input 
            value={title} onChange={e => setTitle(e.target.value)} required 
            placeholder={activeTab === 'activities' ? "Ex: Karting Mario Kart" : "Ex: Villa avec Piscine"}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
          />
        </div>
        <div>
          <label className="block text-xs uppercase text-gray-500 font-bold mb-1 flex items-center gap-1">
            <AlignLeft className="w-3 h-3" /> Description
          </label>
          <textarea 
            value={description} onChange={e => setDescription(e.target.value)} 
            placeholder="Détails, horaires, pourquoi c'est cool..."
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 focus:ring-1 focus:ring-indigo-500 outline-none h-20 resize-none"
          />
        </div>
        <div className="grid grid-cols-2 gap-4 bg-gray-900/50 p-3 rounded-lg border border-gray-700/50">
          <div className="col-span-2 sm:col-span-1">
            <label className="block text-xs uppercase text-gray-500 font-bold mb-1">Prix (€)</label>
            <input 
              type="number" value={cost} onChange={e => setCost(e.target.value)} required 
              placeholder="0"
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 focus:ring-1 focus:ring-indigo-500 outline-none"
            />
          </div>
          <div className="col-span-2 sm:col-span-1">
            <label className="block text-xs uppercase text-gray-500 font-bold mb-1">Type de prix</label>
            <div className="flex bg-gray-900 rounded-lg p-1 border border-gray-700">
              <button
                type="button"
                onClick={() => setPriceType('total')}
                className={`flex-1 text-sm py-1.5 rounded-md transition-all ${priceType === 'total' ? 'bg-indigo-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}
              >
                Total
              </button>
              <button
                type="button"
                onClick={() => setPriceType('perPerson')}
                className={`flex-1 text-sm py-1.5 rounded-md transition-all ${priceType === 'perPerson' ? 'bg-indigo-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}
              >
                / Pers
              </button>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs uppercase text-gray-500 font-bold mb-1 flex items-center gap-1">
              <ExternalLink className="w-3 h-3" /> Lien (Info/Resa)
            </label>
            <input 
              type="url" value={link} onChange={e => setLink(e.target.value)} 
              placeholder="https://..."
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 focus:ring-1 focus:ring-indigo-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs uppercase text-gray-500 font-bold mb-1 flex items-center gap-1">
              <ImageIcon className="w-3 h-3" /> Mot-clé Image (IA)
            </label>
            <input 
              value={imageKeyword} onChange={e => setImageKeyword(e.target.value)} 
              placeholder="Ex: Karting, Piscine, Bière..."
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 focus:ring-1 focus:ring-indigo-500 outline-none"
            />
            <p className="text-[10px] text-gray-500 mt-1">Génère une image IA unique.</p>
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
  const [editImageKeyword, setEditImageKeyword] = useState('');

  const hasVoted = item.votes.includes(userId);
  const voteCount = item.votes.length;
  const isTrending = voteCount >= (totalParticipants / 2) && totalParticipants > 0;
  
  const displayCost = item.priceType === 'perPerson' 
    ? (item.cost * Math.max(totalParticipants, 1)) 
    : item.cost;

  const handleSave = async (e) => {
    e.stopPropagation();
    const updateData = {
      title: editTitle,
      cost: parseFloat(editCost) || 0,
      description: editDesc,
      link: editLink,
    };
    if (editImageKeyword) {
      updateData.imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(editImageKeyword)}`;
    }
    await onUpdate(item.id, updateData);
    setIsEditing(false);
    setIsFlipped(false);
  };

  const toggleFlip = (e) => {
    e.stopPropagation();
    setIsFlipped(!isFlipped);
  };

  if (isEditing) {
    return (
      <Card className="bg-gray-800 border-indigo-500/50">
        <div className="space-y-3" onClick={e => e.stopPropagation()}>
          <h4 className="font-bold text-indigo-400 flex items-center gap-2"><Edit2 className="w-4 h-4"/> Modification</h4>
          <input className="w-full bg-gray-900 p-2 rounded border border-gray-700" value={editTitle} onChange={e => setEditTitle(e.target.value)} placeholder="Titre" />
          <textarea className="w-full bg-gray-900 p-2 rounded border border-gray-700 h-20" value={editDesc} onChange={e => setEditDesc(e.target.value)} placeholder="Description" />
          <div className="flex gap-2">
            <input className="w-1/2 bg-gray-900 p-2 rounded border border-gray-700" type="number" value={editCost} onChange={e => setEditCost(e.target.value)} placeholder="Prix" />
            <input className="w-1/2 bg-gray-900 p-2 rounded border border-gray-700" value={editLink} onChange={e => setEditLink(e.target.value)} placeholder="Lien" />
          </div>
          <input className="w-full bg-gray-900 p-2 rounded border border-gray-700" value={editImageKeyword} onChange={e => setEditImageKeyword(e.target.value)} placeholder="Nouveau mot clé image (optionnel)" />
          <div className="flex justify-end gap-2 mt-2">
            <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); setIsEditing(false); }}>Annuler</Button>
            <Button size="sm" onClick={handleSave}><Save className="w-4 h-4"/> Enregistrer</Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className={`relative group bg-gray-800 rounded-xl overflow-hidden border transition-all flex flex-col h-full ${item.validated ? 'border-green-500/50 shadow-lg shadow-green-900/20' : 'border-gray-700'}`}>
      
      {/* FACE AVANT (Toujours rendue, mais invisible si retournée pour garder la hauteur) */}
      <div className={`${isFlipped ? 'invisible' : ''} flex-1 flex flex-col`}>
          {item.imageUrl && (
            <div className="h-40 w-full overflow-hidden relative bg-gray-900">
               <img 
                src={item.imageUrl} 
                alt={item.title}
                className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500"
                onError={(e) => {e.target.style.display='none'}}
               />
               <div className="absolute inset-0 bg-gradient-to-t from-gray-800 via-transparent to-transparent" />
            </div>
          )}

          <div className="absolute top-3 right-3 z-10" onClick={e => e.stopPropagation()}>
            {isAdmin ? (
              <button 
                onClick={onToggleValidate}
                className={`w-10 h-6 rounded-full p-1 transition-colors flex items-center shadow-lg ${item.validated ? 'bg-green-500 justify-end' : 'bg-gray-600 justify-start'}`}
              >
                <div className="w-4 h-4 rounded-full bg-white shadow-sm" />
              </button>
            ) : (
              item.validated && <div className="shadow-lg"><Badge type="success"><CheckCircle className="w-3 h-3 inline mr-1"/>Validé</Badge></div>
            )}
          </div>

          <div className="p-5 flex-1 flex flex-col">
            <div className="flex justify-between items-start mb-2 pr-8">
              <h3 className="font-bold text-lg leading-tight">{item.title}</h3>
            </div>
            
            <div className="flex items-baseline gap-2 mb-3">
                <span className="text-2xl font-light text-white">{item.cost} €</span>
                <span className="text-xs font-medium px-2 py-0.5 rounded bg-gray-700 text-gray-300">
                    {item.priceType === 'perPerson' ? '/ pers' : 'Total'}
                </span>
                {item.priceType === 'perPerson' && totalParticipants > 1 && (
                    <span className="text-xs text-gray-500 ml-1">
                        (Total: {displayCost} €)
                    </span>
                )}
            </div>

            <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-700/50">
              <div className="flex items-center gap-3">
                <button 
                  onClick={onVote}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all text-sm font-medium ${
                    hasVoted 
                      ? 'bg-indigo-500 text-white shadow-indigo-500/30' 
                      : 'bg-gray-700 text-gray-400 hover:bg-gray-600 hover:text-white'
                  }`}
                >
                  <ThumbsUp className={`w-4 h-4 ${hasVoted ? 'fill-current' : ''}`} />
                  {voteCount}
                </button>
                {isTrending && !item.validated && (
                  <span className="text-xs text-yellow-500 font-medium flex items-center gap-1 animate-pulse">
                     🔥 Tendance
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-600">par {item.addedBy}</span>
                {(item.addedBy === userId || isAdmin) && (
                  <button onClick={onDelete} className="text-gray-600 hover:text-red-400 p-1 rounded-md hover:bg-red-500/10 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
      </div>

      {/* Bouton Flip (Toujours visible au premier plan) */}
      <button 
         onClick={toggleFlip}
         className="absolute bottom-2 right-2 z-20 bg-black/50 hover:bg-black/70 backdrop-blur rounded-full p-2 text-white transition-all shadow-lg"
         title="Plus d'infos"
      >
         <RotateCw className="w-4 h-4" />
      </button>

      {/* FACE ARRIÈRE (Superposée) */}
      {isFlipped && (
        <div className="absolute inset-0 bg-gray-800 p-6 flex flex-col h-full animate-fade-in z-30">
          <div className="flex justify-between items-start mb-4">
             <h3 className="font-bold text-lg text-indigo-400">{item.title}</h3>
             <button onClick={toggleFlip} className="text-gray-500 hover:text-white"><X className="w-5 h-5" /></button>
          </div>
          
          <div className="flex-1 overflow-y-auto mb-4 text-sm text-gray-300 whitespace-pre-wrap">
            {item.description || "Pas de description fournie."}
          </div>

          <div className="space-y-3 mt-auto" onClick={e => e.stopPropagation()}>
            {item.link && (
              <a href={item.link} target="_blank" rel="noopener noreferrer" className="block w-full py-2 bg-gray-700 hover:bg-gray-600 rounded text-center text-sm font-medium transition-colors">
                <ExternalLink className="w-4 h-4 inline mr-2" /> Voir le lien
              </a>
            )}
            
            <button 
              onClick={(e) => { e.stopPropagation(); setIsEditing(true); }}
              className="w-full py-2 border border-gray-600 hover:border-indigo-500 hover:text-indigo-400 rounded text-center text-sm font-medium transition-colors flex items-center justify-center gap-2"
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
  const [activeTab, setActiveTab] = useState('activities');
  const [items, setItems] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [logistics, setLogistics] = useState({ dates: [], cars: [] });
  // Default access code is 1234
  const [settings, setSettings] = useState({ title: "EVG Légendaire", date: "", accessCode: "1234" });
  const [participants, setParticipants] = useState([]);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // Initialisation Auth
  useEffect(() => {
    const initAuth = async () => {
      if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
        await signInWithCustomToken(auth, __initial_auth_token);
      } else {
        await signInAnonymously(auth);
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  // Chargement des données
  useEffect(() => {
    if (!user) return;

    // Items
    const itemsQuery = query(collection(db, 'artifacts', appId, 'public', 'data', 'evg_items'));
    const unsubItems = onSnapshot(itemsQuery, (snapshot) => {
      const itemsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setItems(itemsData);
    }, (error) => console.error("Erreur items:", error));

    // Expenses
    const expensesQuery = query(collection(db, 'artifacts', appId, 'public', 'data', 'evg_expenses'));
    const unsubExpenses = onSnapshot(expensesQuery, (snapshot) => {
      const expensesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setExpenses(expensesData);
    }, (error) => console.error("Erreur expenses:", error));

    // Logistics (Dates & Cars)
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

    // Settings
    const settingsRef = doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'main');
    const unsubSettings = onSnapshot(settingsRef, (docSnap) => {
      if (docSnap.exists()) {
        setSettings(docSnap.data());
      } else {
        setDoc(settingsRef, { title: "EVG Légendaire", date: "", accessCode: "1234" });
      }
    }, (error) => console.error("Erreur settings:", error));

    // Participants
    const participantsRef = doc(db, 'artifacts', appId, 'public', 'data', 'participants', 'list');
    const unsubParticipants = onSnapshot(participantsRef, (docSnap) => {
      if (docSnap.exists()) {
        setParticipants(docSnap.data().names || []);
      }
    }, (error) => console.error("Erreur participants:", error));

    return () => {
      unsubItems();
      unsubExpenses();
      unsubSettings();
      unsubParticipants();
      unsubDates();
      unsubCars();
    };
  }, [user]);

  // Actions
  const handleJoin = async (name, code) => {
    if (!name.trim()) return;
    
    // Check security code (default 1234 if not set)
    const requiredCode = settings.accessCode || "1234";
    if (code !== requiredCode) {
      alert("Code d'accès incorrect ! Demande à l'organisateur.");
      return;
    }

    localStorage.setItem('evg_username', name);
    setUsername(name);
    setIsJoined(true);
    
    if (!participants.includes(name)) {
      const newParticipants = [...participants, name];
      const ref = doc(db, 'artifacts', appId, 'public', 'data', 'participants', 'list');
      await setDoc(ref, { names: newParticipants }, { merge: true });
    }
  };

  const handleAddParticipantByAdmin = async (name) => {
    if (!name.trim()) return;
    if (!participants.includes(name)) {
      const newParticipants = [...participants, name];
      const ref = doc(db, 'artifacts', appId, 'public', 'data', 'participants', 'list');
      await setDoc(ref, { names: newParticipants }, { merge: true });
    }
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

  // Logistics Actions
  const handleAddDate = async (dateVal) => {
    await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'evg_dates'), {
      date: dateVal,
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

  // Calculs Budgétaires
  const budget = useMemo(() => {
    const activities = items.filter(i => i.type === 'activity');
    const housing = items.filter(i => i.type === 'housing');
    const allItems = [...activities, ...housing];
    const userCount = Math.max(participants.length, 1);

    const calculateItemCost = (item) => {
      const baseCost = parseFloat(item.cost) || 0;
      if (item.priceType === 'perPerson') {
        return baseCost * userCount;
      }
      return baseCost;
    };

    const validated = allItems
      .filter(i => i.validated)
      .reduce((acc, curr) => acc + calculateItemCost(curr), 0);

    const trending = allItems
      .filter(i => i.validated || (i.votes.length >= userCount / 2))
      .reduce((acc, curr) => acc + calculateItemCost(curr), 0);

    const total = allItems
      .reduce((acc, curr) => acc + calculateItemCost(curr), 0);

    return { validated, trending, total, userCount };
  }, [items, participants]);

  // Balance
  const balance = useMemo(() => {
    if (participants.length === 0) return { balances: {}, debts: [] };

    const balances = {};
    participants.forEach(p => balances[p] = 0);
    
    let totalSpent = 0;

    expenses.forEach(exp => {
      const amount = parseFloat(exp.amount) || 0;
      const payer = exp.payer;
      
      totalSpent += amount;

      if (payer === 'Tous') {
        return;
      }

      if (balances[payer] !== undefined) {
        balances[payer] += amount;
      }

      const share = amount / Math.max(participants.length, 1);
      participants.forEach(p => {
        balances[p] -= share;
      });
    });

    const debts = [];
    const debtors = Object.entries(balances).filter(([, bal]) => bal < -0.01).sort((a, b) => a[1] - b[1]); 
    const creditors = Object.entries(balances).filter(([, bal]) => bal > 0.01).sort((a, b) => b[1] - a[1]); 

    let i = 0;
    let j = 0;

    while (i < debtors.length && j < creditors.length) {
      const debtor = debtors[i];
      const creditor = creditors[j];
      
      const debtAmount = Math.min(Math.abs(debtor[1]), creditor[1]);
      
      debts.push({
        from: debtor[0],
        to: creditor[0],
        amount: debtAmount
      });

      debtor[1] += debtAmount;
      creditor[1] -= debtAmount;

      if (Math.abs(debtor[1]) < 0.01) i++;
      if (creditor[1] < 0.01) j++;
    }

    return { balances, debts, totalSpent };
  }, [expenses, participants]);

  if (!user) return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">Chargement...</div>;
  
  if (!isJoined) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-6 text-white">
        <div className="max-w-md w-full bg-gray-800 p-8 rounded-2xl shadow-2xl border border-gray-700">
          <div className="text-center mb-8">
            <Beer className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h1 className="text-3xl font-black mb-2">{settings.title}</h1>
            <p className="text-gray-400">L'application pour organiser le meilleur EVG.</p>
          </div>
          <form onSubmit={(e) => { e.preventDefault(); handleJoin(e.target.name.value, e.target.code.value); }} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Ton Prénom</label>
              <input 
                name="name"
                type="text" 
                required
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="Ex: Thomas"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Code d'accès</label>
              <input 
                name="code"
                type="password" 
                required
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="Ex: 1234"
              />
            </div>
            <Button className="w-full" type="submit">Rejoindre la Team</Button>
          </form>
        </div>
      </div>
    );
  }

  const TabButton = ({ id, icon: Icon, label }) => (
    <button
      onClick={() => { setActiveTab(id); setShowMobileMenu(false); }}
      className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-all w-full md:w-auto ${
        activeTab === id 
          ? 'bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-500/20' 
          : 'text-gray-400 hover:text-white hover:bg-gray-800'
      }`}
    >
      <Icon className="w-5 h-5" />
      <span>{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans pb-24 md:pb-0">
      
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-yellow-400 to-orange-500 p-2 rounded-lg">
              <Beer className="w-6 h-6 text-gray-900" />
            </div>
            {isAdminMode ? (
              <div className="flex flex-col gap-1">
                <input 
                  type="text" 
                  value={settings.title}
                  onChange={(e) => handleUpdateSettings({ title: e.target.value })}
                  className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-lg font-bold w-48 md:w-auto focus:ring-2 focus:ring-indigo-500"
                />
                <div className="flex items-center gap-1">
                  <KeyRound className="w-3 h-3 text-gray-400" />
                  <input 
                    type="text" 
                    value={settings.accessCode || "1234"}
                    onChange={(e) => handleUpdateSettings({ accessCode: e.target.value })}
                    className="bg-gray-700 border border-gray-600 rounded px-1 py-0.5 text-xs text-gray-300 w-20 focus:ring-2 focus:ring-indigo-500"
                    placeholder="Code d'accès"
                  />
                </div>
              </div>
            ) : (
              <h1 className="text-xl font-bold truncate max-w-[200px] md:max-w-none">{settings.title}</h1>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsAdminMode(!isAdminMode)}
              className={`p-2 rounded-lg transition-colors ${isAdminMode ? 'bg-red-500/20 text-red-400' : 'bg-gray-700 text-gray-400 hover:text-white'}`}
              title="Mode Organisateur"
            >
              {isAdminMode ? <Unlock className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
            </button>
            <div className="hidden md:flex bg-gray-700 px-3 py-1.5 rounded-full text-sm">
              <span className="text-gray-400 mr-1">Moi:</span>
              <span className="font-semibold text-white">{username}</span>
            </div>
          </div>
        </div>

        {/* Navigation Desktop */}
        <div className="hidden md:block border-t border-gray-700">
          <div className="max-w-6xl mx-auto px-4 flex gap-2 py-2 overflow-x-auto">
            <TabButton id="activities" icon={Beer} label="Activités" />
            <TabButton id="housing" icon={Home} label="Logement" />
            <TabButton id="budget" icon={Wallet} label="Budget" />
            <TabButton id="logistics" icon={Calendar} label="Logistique" />
            <TabButton id="balance" icon={Scale} label="Comptes" />
            <TabButton id="participants" icon={Users} label="Participants" />
          </div>
        </div>
      </header>

      {/* Navigation Mobile */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700 z-40 px-1 py-2 flex justify-between items-center safe-area-pb text-[9px] sm:text-xs">
        <button onClick={() => setActiveTab('activities')} className={`flex flex-col items-center p-2 rounded-lg flex-1 ${activeTab === 'activities' ? 'text-indigo-400 bg-gray-700/50' : 'text-gray-500'}`}>
          <Beer className="w-5 h-5 mb-1" /> Activités
        </button>
        <button onClick={() => setActiveTab('housing')} className={`flex flex-col items-center p-2 rounded-lg flex-1 ${activeTab === 'housing' ? 'text-indigo-400 bg-gray-700/50' : 'text-gray-500'}`}>
          <Home className="w-5 h-5 mb-1" /> Logement
        </button>
        <button onClick={() => setActiveTab('budget')} className={`flex flex-col items-center p-2 rounded-lg flex-1 ${activeTab === 'budget' ? 'text-indigo-400 bg-gray-700/50' : 'text-gray-500'}`}>
          <Wallet className="w-5 h-5 mb-1" /> Budget
        </button>
        <button onClick={() => setActiveTab('logistics')} className={`flex flex-col items-center p-2 rounded-lg flex-1 ${activeTab === 'logistics' ? 'text-indigo-400 bg-gray-700/50' : 'text-gray-500'}`}>
          <Calendar className="w-5 h-5 mb-1" /> Logist.
        </button>
        <button onClick={() => setActiveTab('balance')} className={`flex flex-col items-center p-2 rounded-lg flex-1 ${activeTab === 'balance' ? 'text-indigo-400 bg-gray-700/50' : 'text-gray-500'}`}>
          <Scale className="w-5 h-5 mb-1" /> Comptes
        </button>
        <button onClick={() => setActiveTab('participants')} className={`flex flex-col items-center p-2 rounded-lg flex-1 ${activeTab === 'participants' ? 'text-indigo-400 bg-gray-700/50' : 'text-gray-500'}`}>
          <Users className="w-5 h-5 mb-1" /> Potes
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
                <div className="col-span-full py-12 text-center text-gray-500 bg-gray-800/50 rounded-xl border border-dashed border-gray-700">
                  <p>Aucune proposition pour le moment.</p>
                  <p className="text-sm">Soyez le premier à proposer !</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Vue Logistique */}
        {activeTab === 'logistics' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Sondage Dates */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold flex items-center gap-2"><Calendar className="w-6 h-6 text-indigo-400"/> Sondage Dates</h2>
              
              <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
                 <form onSubmit={(e) => {
                   e.preventDefault();
                   if(e.target.date.value) {
                     handleAddDate(e.target.date.value);
                     e.target.date.value = '';
                   }
                 }} className="flex gap-2 mb-4">
                   <input name="date" type="date" className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white" required />
                   <Button size="sm" type="submit"><Plus className="w-4 h-4"/></Button>
                 </form>

                 <div className="space-y-2">
                   {logistics.dates.sort((a,b) => new Date(a.date) - new Date(b.date)).map(dateItem => {
                     const votes = dateItem.votes || [];
                     const hasVoted = votes.includes(username);
                     return (
                       <div key={dateItem.id} className="flex items-center justify-between bg-gray-700/50 p-3 rounded-lg border border-gray-700">
                         <div className="flex flex-col">
                            <span className="font-bold">{new Date(dateItem.date).toLocaleDateString()}</span>
                            <span className="text-xs text-gray-400">{votes.length} votes</span>
                         </div>
                         <div className="flex items-center gap-2">
                           <button 
                             onClick={() => handleVoteDate(dateItem)}
                             className={`p-2 rounded-lg transition-all ${hasVoted ? 'bg-indigo-500 text-white' : 'bg-gray-600 text-gray-400 hover:text-white'}`}
                           >
                             <ThumbsUp className="w-4 h-4" />
                           </button>
                           {(dateItem.addedBy === username || isAdminMode) && (
                             <button onClick={() => handleDeleteLogistics('evg_dates', dateItem.id)} className="text-gray-500 hover:text-red-400">
                               <Trash2 className="w-4 h-4" />
                             </button>
                           )}
                         </div>
                       </div>
                     )
                   })}
                   {logistics.dates.length === 0 && <p className="text-gray-500 text-sm italic">Aucune date proposée.</p>}
                 </div>
              </div>
            </div>

            {/* Covoiturage */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold flex items-center gap-2"><Car className="w-6 h-6 text-indigo-400"/> Voitures Dispos</h2>
              
              <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
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
                   <input name="driver" placeholder="Conducteur" className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white" required />
                   <input name="seats" type="number" placeholder="Places" className="w-20 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white" required />
                   <Button size="sm" type="submit"><Plus className="w-4 h-4"/></Button>
                 </form>

                 <div className="space-y-2">
                   {logistics.cars.map(car => (
                     <div key={car.id} className="flex items-center justify-between bg-gray-700/50 p-3 rounded-lg border border-gray-700">
                       <div className="flex items-center gap-3">
                          <Car className="w-5 h-5 text-indigo-400"/>
                          <div>
                            <div className="font-bold">{car.driver}</div>
                            <div className="text-xs text-gray-400">{car.seats} places disponibles</div>
                          </div>
                       </div>
                       {(car.addedBy === username || isAdminMode) && (
                         <button onClick={() => handleDeleteLogistics('evg_cars', car.id)} className="text-gray-500 hover:text-red-400">
                           <Trash2 className="w-4 h-4" />
                         </button>
                       )}
                     </div>
                   ))}
                    {logistics.cars.length === 0 && <p className="text-gray-500 text-sm italic">Aucune voiture déclarée.</p>}
                 </div>
              </div>
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
                color="text-green-400"
                desc="Le coût réel du weekend"
              />
              <BudgetCard 
                title="Budget Tendance" 
                amount={budget.trending} 
                icon={ThumbsUp}
                color="text-yellow-400"
                desc="Ce qui plaît à la majorité (>50%)"
              />
              <BudgetCard 
                title="Budget Total" 
                amount={budget.total} 
                icon={Wallet}
                color="text-blue-400"
                desc="Si on craque le PEL"
              />
            </div>

            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-xl">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Calculator className="w-5 h-5 text-indigo-400" />
                Détail des coûts (pour {budget.userCount} personnes)
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-700 text-gray-400 text-sm">
                      <th className="py-2 pl-2">Scénario</th>
                      <th className="py-2 text-right">Total Groupe</th>
                      <th className="py-2 text-right pr-2">Par Personne</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-200">
                    <tr className="border-b border-gray-700/50 hover:bg-white/5 transition-colors">
                      <td className="py-3 pl-2 text-green-400 font-medium flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" /> Validé
                      </td>
                      <td className="py-3 text-right font-mono">{budget.validated.toFixed(0)} €</td>
                      <td className="py-3 text-right pr-2 font-mono font-bold">{(budget.validated / budget.userCount).toFixed(2)} €</td>
                    </tr>
                    <tr className="border-b border-gray-700/50 hover:bg-white/5 transition-colors">
                      <td className="py-3 pl-2 text-yellow-400 font-medium flex items-center gap-2">
                        <ThumbsUp className="w-4 h-4" /> Tendance
                      </td>
                      <td className="py-3 text-right font-mono">{budget.trending.toFixed(0)} €</td>
                      <td className="py-3 text-right pr-2 font-mono font-bold">{(budget.trending / budget.userCount).toFixed(2)} €</td>
                    </tr>
                    <tr className="hover:bg-white/5 transition-colors">
                      <td className="py-3 pl-2 text-blue-400 font-medium flex items-center gap-2">
                        <Wallet className="w-4 h-4" /> Max Total
                      </td>
                      <td className="py-3 text-right font-mono">{budget.total.toFixed(0)} €</td>
                      <td className="py-3 text-right pr-2 font-mono font-bold">{(budget.total / budget.userCount).toFixed(2)} €</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Vue Comptes / Balance */}
        {activeTab === 'balance' && (
          <div className="space-y-6">
            
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <Card className="bg-gradient-to-br from-indigo-900 to-gray-800 border-indigo-500/30">
                 <h3 className="text-gray-400 uppercase text-xs font-bold mb-2 flex items-center gap-2"><Euro className="w-4 h-4" /> Total Dépensé</h3>
                 <div className="text-3xl font-black">{balance.totalSpent.toFixed(0)} €</div>
                 <div className="text-sm text-gray-300 mt-1">
                    Soit <strong className="text-white">{(balance.totalSpent / Math.max(participants.length, 1)).toFixed(2)} €</strong> / personne
                 </div>
               </Card>

               <Card>
                 <h3 className="text-gray-400 uppercase text-xs font-bold mb-4 flex items-center gap-2"><Scale className="w-4 h-4" /> Équilibre</h3>
                 <div className="space-y-2 max-h-40 overflow-y-auto">
                   {participants.map(p => {
                     const bal = balance.balances[p] || 0;
                     return (
                       <div key={p} className="flex justify-between items-center text-sm">
                         <span>{p}</span>
                         <span className={`font-mono font-bold ${bal > 0 ? 'text-green-400' : (bal < 0 ? 'text-red-400' : 'text-gray-500')}`}>
                           {bal > 0 ? '+' : ''}{bal.toFixed(2)} €
                         </span>
                       </div>
                     );
                   })}
                 </div>
               </Card>
             </div>

             {/* Plan de remboursement */}
             {balance.debts.length > 0 && (
               <Card className="border-yellow-500/30">
                 <h3 className="text-yellow-500 font-bold mb-4 flex items-center gap-2">
                   <ArrowRight className="w-5 h-5" /> Pour équilibrer les comptes
                 </h3>
                 <div className="grid gap-2">
                   {balance.debts.map((debt, idx) => (
                     <div key={idx} className="bg-gray-700/50 p-3 rounded-lg flex items-center justify-between">
                       <div className="flex items-center gap-2">
                         <span className="font-bold text-red-300">{debt.from}</span>
                         <span className="text-gray-400 text-sm">doit payer</span>
                         <span className="font-bold text-green-300">{debt.to}</span>
                       </div>
                       <span className="font-mono font-bold bg-gray-900 px-2 py-1 rounded text-yellow-400">
                         {debt.amount.toFixed(2)} €
                       </span>
                     </div>
                   ))}
                 </div>
               </Card>
             )}

             {/* Section Importation des éléments validés */}
             <div className="bg-indigo-900/20 border border-indigo-500/30 rounded-xl p-4">
               <h3 className="font-bold text-indigo-300 mb-3 text-sm uppercase">Activités validées à régler</h3>
               <div className="space-y-2">
                 {items.filter(i => i.validated && !expenses.some(e => e.relatedItemId === i.id)).map(item => {
                    const amount = item.priceType === 'perPerson' ? (item.cost * participants.length) : item.cost;
                    
                    return (
                     <div key={item.id} className="bg-gray-800 p-3 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                       <div>
                         <div className="font-medium">{item.title}</div>
                         <div className="text-xs text-gray-400">{amount} € ({item.priceType === 'perPerson' ? 'par tête calculé' : 'total'})</div>
                       </div>
                       <div className="flex items-center gap-2">
                         <select 
                           className="bg-gray-700 border-none text-sm rounded px-2 py-1.5 outline-none focus:ring-1 focus:ring-indigo-500"
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
                   <div className="text-gray-500 text-sm italic">Toutes les activités validées sont comptabilisées !</div>
                 )}
               </div>
             </div>

             {/* Formulaire ajout dépense manuelle */}
             <AddExpenseForm participants={participants} onAdd={handleAddExpense} />

             {/* Liste des dépenses */}
             <div className="space-y-2">
               <h3 className="font-bold text-gray-400 text-sm uppercase mb-2">Historique</h3>
               {expenses.sort((a,b) => b.createdAt - a.createdAt).map(exp => (
                 <div key={exp.id} className="bg-gray-800 border border-gray-700 p-3 rounded-lg flex items-center justify-between">
                   <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${exp.payer === 'Tous' ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-400'}`}>
                        {exp.payer === 'Tous' ? 'A' : exp.payer.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium">{exp.title}</div>
                        <div className="text-xs text-gray-500">{exp.payer === 'Tous' ? 'Payé par chacun' : `Payé par ${exp.payer}`}</div>
                      </div>
                   </div>
                   <div className="flex items-center gap-3">
                     <span className="font-mono font-bold">{exp.amount} €</span>
                     {(exp.addedBy === username || isAdminMode) && (
                       <button onClick={() => handleDeleteExpense(exp.id)} className="text-gray-600 hover:text-red-400">
                         <Trash2 className="w-4 h-4" />
                       </button>
                     )}
                   </div>
                 </div>
               ))}
               {expenses.length === 0 && <div className="text-center text-gray-500 py-4">Aucune dépense enregistrée.</div>}
             </div>
          </div>
        )}

        {/* Vue Participants */}
        {activeTab === 'participants' && (
          <div className="max-w-2xl mx-auto space-y-6">
             <Card>
               <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                 <Users className="w-6 h-6 text-indigo-400" />
                 La Team ({participants.length})
               </h3>
               
               {/* Admin Add Participant */}
               {isAdminMode && (
                 <form onSubmit={(e) => {
                   e.preventDefault();
                   handleAddParticipantByAdmin(e.target.name.value);
                   e.target.name.value = '';
                 }} className="mb-4 flex gap-2">
                   <input 
                     name="name" 
                     placeholder="Ajouter un pote..." 
                     className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
                   />
                   <Button size="sm" type="submit"><Plus className="w-4 h-4" /> Ajout</Button>
                 </form>
               )}

               <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                 {participants.map((p, idx) => (
                   <div key={idx} className="flex items-center gap-3 bg-gray-700/50 p-3 rounded-lg border border-gray-700">
                     <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-lg font-bold shadow-lg">
                       {p.charAt(0).toUpperCase()}
                     </div>
                     <span className="font-medium">{p}</span>
                     {p === username && <span className="ml-auto text-xs bg-indigo-500/20 text-indigo-300 px-2 py-1 rounded border border-indigo-500/30">Moi</span>}
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
