import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { AuthService } from "@/lib/authService";
import { useNavigate } from "react-router-dom";
import { json } from "stream/consumers";

interface User {
  id: string;
  nom: string;
  email: string;
  role: string;
}
const Login = () => {
  const [utilisateur, setUtilisateur] = useState({
    email: "",
    mdp: "",
    role: "",
    nom: "",
  });
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Initialisation de la scène 3D
  useEffect(() => {
    if (!canvasRef.current) return;

    // Configuration de la scène Three.js
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    canvasRef.current.appendChild(renderer.domElement);

    // Création d'un réseau de neurones 3D
    const nodes: THREE.Mesh[] = [];
    const lines: THREE.Line[] = [];
    const nodeGeometry = new THREE.SphereGeometry(0.05, 16, 16);
    const nodeMaterial = new THREE.MeshBasicMaterial({
      color: 0x4f46e5,
      transparent: true,
      opacity: 0.8,
    });

    // Création des noeuds
    for (let i = 0; i < 50; i++) {
      const node = new THREE.Mesh(nodeGeometry, nodeMaterial.clone());
      node.position.set(
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 10
      );
      nodes.push(node);
      scene.add(node);
    }

    // Création des connexions
    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0x818cf8,
      transparent: true,
      opacity: 0.3,
    });

    nodes.forEach((node, i) => {
      const connections = Math.floor(Math.random() * 3) + 1;
      for (let j = 0; j < connections; j++) {
        const targetIndex =
          (i + Math.floor(Math.random() * nodes.length)) % nodes.length;
        const geometry = new THREE.BufferGeometry().setFromPoints([
          node.position,
          nodes[targetIndex].position,
        ]);
        const line = new THREE.Line(geometry, lineMaterial);
        lines.push(line);
        scene.add(line);
      }
    });

    // Ajout d'un cube de données rotatif
    const dataCube = new THREE.Mesh(
      new THREE.BoxGeometry(3, 3, 3),
      new THREE.MeshBasicMaterial({
        color: 0x3b82f6,
        wireframe: true,
        transparent: true,
        opacity: 0.5,
      })
    );
    scene.add(dataCube);

    // Positionnement de la caméra
    camera.position.z = 5;

    // Contrôles orbitaux
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.5;

    // Animation
    const animate = () => {
      requestAnimationFrame(animate);

      // Animation des noeuds
      nodes.forEach((node) => {
        node.position.x += (Math.random() - 0.5) * 0.01;
        node.position.y += (Math.random() - 0.5) * 0.01;
        node.position.z += (Math.random() - 0.5) * 0.01;
      });

      // Rotation du cube de données
      dataCube.rotation.x += 0.005;
      dataCube.rotation.y += 0.007;

      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    // Nettoyage
    return () => {
      if (
        canvasRef.current &&
        canvasRef.current.contains(renderer.domElement)
      ) {
        canvasRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  //AUthentification

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await AuthService.login(utilisateur);
      setIsAuthenticating(true);

      const user: User = {
        id: response.id,
        nom: response.nom,
        email: response.email,
        role: response.role,
      };
      localStorage.setItem("user", JSON.stringify(user));
      navigate("/dashboard");
    } catch (error) {
      console.error("Échec de la connexion:", error);
    }
    navigate("/dashboard");
    // Simulation de l'authentification
    setTimeout(() => {
      setIsAuthenticating(false);
      // Ici vous pourriez rediriger vers le dashboard
    }, 2000);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setUtilisateur((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Fond 3D avec Three.js */}
      <div ref={canvasRef} className="fixed inset-0 z-0 opacity-80" />

      {/* Interface de connexion */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <AnimatePresence>
            {isAuthenticating ? (
              <motion.div
                key="loader"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-gray-900/80 backdrop-blur-lg rounded-2xl shadow-2xl border border-gray-800 p-8 text-center"
              >
                <div className="flex justify-center mb-6">
                  <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                </div>
                <h3 className="text-xl font-bold text-blue-400 mb-2">
                  Vérification en cours
                </h3>
                <p className="text-gray-300">
                  Authentification de vos identifiants...
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-gray-900/80 backdrop-blur-lg rounded-2xl shadow-2xl overflow-hidden border border-gray-800"
              >
                {/* En-tête holographique */}
                <div className="relative p-6 text-center bg-gradient-to-r from-blue-900/30 to-purple-900/30 border-b border-gray-800">
                  <div className="absolute inset-0 bg-blue-500/10 mix-blend-overlay" />
                  <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-300">
                    PORTAIL EXECUTIVE
                  </h1>
                  <p className="text-blue-200/70 mt-1 text-sm">
                    Accès sécurisé au réseau d'entreprise
                  </p>
                </div>

                {/* Formulaire */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                  <div className="space-y-4">
                    {/* Champ utilisateur */}
                    <div className="relative">
                      <input
                        type="text"
                        name="email"
                        value={utilisateur.email}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-gray-800/50 text-white placeholder-gray-400 rounded-lg border border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                        placeholder="E-mail"
                        
                      />
                      <div className="absolute right-3 top-3 text-blue-400">
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                      </div>
                    </div>

                    {/* Champ mot de passe */}
                    <div className="relative">
                      <input
                        type="password"
                        name="mdp"
                        value={utilisateur.mdp}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-gray-800/50 text-white placeholder-gray-400 rounded-lg border border-gray-700 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                        placeholder="Mot de passe"
                        
                      />
                      <div className="absolute right-3 top-3 text-purple-400">
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                          />
                        </svg>
                      </div>
                    </div>

                    {/* Sélecteur de rôle */}
                    <div className="relative">
                      <select
                        name="role"
                        value={utilisateur.role}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-gray-800/50 text-white rounded-lg border border-gray-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 appearance-none transition-all"
                        
                      >
                        <option value="" disabled>
                          Rôle utilisateur
                        </option>
                        <option value="Directeur General">
                          Directeur Général
                        </option>
                        <option value="Departement financier">
                          Département financier
                        </option>
                        <option value="Departement Stock">
                          Département Stock
                        </option>
                        <option value="Departement Achat">
                          Département Achat
                        </option>
                        <option value="Demandeur">Demandeur</option>
                      </select>
                      <div className="absolute right-3 top-3 text-emerald-400 pointer-events-none">
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Bouton de connexion */}
                  <button
                    type="submit"
                    className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-medium rounded-lg shadow-lg transition-all relative overflow-hidden group"
                  >
                    <span className="relative z-10">Accès sécurisé</span>
                    <span className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <span className="absolute top-0 left-0 w-1/3 h-full bg-white/20 -skew-x-12 transform-gpu transition-all duration-500 group-hover:left-full" />
                  </button>
                </form>

                {/* Pied de page */}
                <div className="px-6 py-4 bg-gray-900/50 text-center border-t border-gray-800">
                  <p className="text-xs text-gray-500">
                    Système protégé © {new Date().getFullYear()} - Tous droits
                    réservés
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
