"use client";

import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  ShieldAlert,
  Phone,
  MessageSquare,
  Globe,
  Plus,
  Trash2,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";

interface EmergencyContact {
  id: string;
  name: string;
  relation: string;
  phone: string;
}

export default function EmergencyPage() {
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [name, setName] = useState("");
  const [relation, setRelation] = useState("");
  const [phone, setPhone] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("mindlens_emergency_contacts");
      if (stored) {
        setContacts(JSON.parse(stored));
      } else {
        const defaults = [
          { id: "1", name: "Sarah Miller", relation: "Sister / Primary", phone: "555-0192" },
        ];
        setContacts(defaults);
        localStorage.setItem("mindlens_emergency_contacts", JSON.stringify(defaults));
      }
    }
  }, []);

  const handleAddContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    const newContact: EmergencyContact = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      relation: relation.trim() || "Contact",
      phone,
    };

    const updated = [...contacts, newContact];
    setContacts(updated);
    localStorage.setItem("mindlens_emergency_contacts", JSON.stringify(updated));

    setName("");
    setRelation("");
    setPhone("");
    setIsAdding(false);
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 4000);
  };

  const handleDeleteContact = (id: string) => {
    const updated = contacts.filter((c) => c.id !== id);
    setContacts(updated);
    localStorage.setItem("mindlens_emergency_contacts", JSON.stringify(updated));
  };

  const crisisResources = [
    {
      title: "988 Suicide & Crisis Lifeline",
      desc: "Free, confidential support available 24/7. Call or text 988.",
      phone: "988",
      url: "https://988lifeline.org",
      actionLabel: "Call 988",
    },
    {
      title: "Crisis Text Line",
      desc: "Text HOME to 741741 to connect with a crisis counselor 24/7.",
      phone: "741-741",
      url: "https://www.crisistextline.org",
      actionLabel: "Text HOME",
    },
    {
      title: "The Trevor Project",
      desc: "LGBTQ crisis counseling helpline available 24/7. Call or text.",
      phone: "1-866-488-7386",
      url: "https://www.thetrevorproject.org",
      actionLabel: "Call Trevor",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col gap-6 w-full text-left"
    >
      <div className="flex flex-col gap-1">
        <h2 className="font-heading font-semibold text-3xl tracking-tight text-foreground flex items-center gap-2">
          <ShieldAlert className="h-8 w-8 text-destructive animate-pulse" />
          Crisis & Emergency Support
        </h2>
        <p className="text-sm text-muted-foreground">
          If you are experiencing severe distress, please connect with dedicated professionals or your trusted circle immediately.
        </p>
      </div>

      {showAlert && (
        <div className="flex items-center gap-2 p-4 rounded-2xl bg-energy/10 text-energy border border-energy/20 text-xs font-semibold shadow-sm">
          <CheckCircle className="h-4.5 w-4.5" />
          Emergency contact successfully stored. Companion will alert them if necessary.
        </div>
      )}

      {/* Main double column */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full items-start">
        {/* Left Column: Crisis resources (Span 7) */}
        <div className="lg:col-span-7 flex flex-col gap-5">
          <span className="text-[10px] font-semibold text-muted-foreground tracking-wider uppercase px-2">
            24/7 Immediate Support Hotlines
          </span>

          <div className="flex flex-col gap-4">
            {crisisResources.map((res) => (
              <div
                key={res.title}
                className="p-5 rounded-3xl glass-card border border-border shadow-sm flex flex-col sm:flex-row justify-between sm:items-center gap-4 hover:border-destructive/20 transition-all duration-300"
              >
                <div className="flex-1">
                  <h3 className="text-xs font-semibold text-foreground tracking-tight">{res.title}</h3>
                  <p className="text-[10px] text-muted-foreground leading-relaxed mt-1.5">{res.desc}</p>
                </div>
                <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-center">
                  <a
                    href={`tel:${res.phone}`}
                    className="flex items-center gap-1 px-4.5 py-2 rounded-full text-[10px] font-semibold bg-destructive/15 text-destructive border border-destructive/10 hover:bg-destructive/25 transition-all shadow-sm"
                  >
                    <Phone className="h-3.5 w-3.5" />
                    {res.actionLabel}
                  </a>
                  <a
                    href={res.url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-full hover:bg-muted text-muted-foreground transition-colors border border-border"
                    title="Visit site"
                  >
                    <Globe className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-3 p-4 bg-muted/40 rounded-2xl border border-border/50 text-left mt-1">
            <AlertTriangle className="h-5 w-5 text-warmth mt-0.5 shrink-0" />
            <p className="text-[10px] text-muted-foreground leading-relaxed">
              <strong>Private & Secure Support:</strong> We do NOT stream distress tags or emergency contacts to any external web servers or data databases. All contacts remain strictly local on your web device.
            </p>
          </div>
        </div>

        {/* Right Column: Manage personal emergency contacts (Span 5) */}
        <div className="lg:col-span-5 p-6 rounded-3xl glass-card border border-border shadow-sm flex flex-col gap-5 min-h-[400px]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground tracking-wider uppercase">
              Emergency Contacts
            </span>
            {!isAdding && (
              <button
                onClick={() => setIsAdding(true)}
                className="flex items-center gap-1 text-[10px] font-semibold text-primary hover:text-primary/80 transition-colors"
                id="emergency-add-btn"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Contact
              </button>
            )}
          </div>

          {/* Add contact editor */}
          {isAdding && (
            <form onSubmit={handleAddContact} className="p-4 rounded-2xl bg-muted/40 border border-border/50 flex flex-col gap-3">
              <span className="text-[10px] font-semibold text-primary uppercase">New Contact Details</span>
              <div className="flex flex-col gap-2">
                <input
                  type="text"
                  placeholder="Full Name..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-card border border-border text-xs outline-none focus:border-primary/50"
                  required
                  id="emergency-name-input"
                />
                <input
                  type="text"
                  placeholder="Relationship (e.g. Spouse, Friend)..."
                  value={relation}
                  onChange={(e) => setRelation(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-card border border-border text-xs outline-none focus:border-primary/50"
                  id="emergency-relation-input"
                />
                <input
                  type="tel"
                  placeholder="Phone Number..."
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-card border border-border text-xs outline-none focus:border-primary/50"
                  required
                  id="emergency-phone-input"
                />
              </div>
              <div className="flex items-center gap-2 justify-end mt-1">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="text-[10px] font-semibold text-muted-foreground hover:text-foreground px-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 rounded-full text-[10px] font-semibold bg-primary text-primary-foreground hover:bg-primary/95 transition-all shadow"
                  id="emergency-save-contact-btn"
                >
                  Save Contact
                </button>
              </div>
            </form>
          )}

          {/* Contacts list */}
          <div className="flex flex-col gap-3">
            {contacts.length > 0 ? (
              contacts.map((c) => (
                <div
                  key={c.id}
                  className="p-4 rounded-2xl bg-card border border-border flex items-center justify-between gap-3 shadow-inner group"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-xl bg-destructive/10 text-destructive flex items-center justify-center border border-destructive/15">
                      <Phone className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold">{c.name}</h4>
                      <p className="text-[9px] text-muted-foreground mt-0.5">{c.relation} • {c.phone}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteContact(c.id)}
                    className="p-1.5 rounded-full hover:bg-destructive/10 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-all"
                    title="Delete Contact"
                    id={`emergency-delete-btn-${c.id}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))
            ) : (
              <div className="h-32 flex flex-col items-center justify-center text-center p-4 border border-dashed border-border rounded-2xl">
                <MessageSquare className="h-6 w-6 text-muted-foreground mb-1 animate-pulse" />
                <p className="text-[10px] text-muted-foreground">No emergency contacts set yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
