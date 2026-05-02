import { motion } from 'motion/react';
import { Sparkles, Info } from 'lucide-react';

const NAMES_OF_ALLAH = [
  { name: "Ar-Rahman", transliteration: "The Most Merciful", meaning: "The One who has plenty of mercy for the believers and the blasphemers in this world." },
  { name: "Ar-Raheem", transliteration: "The Most Compassionate", meaning: "The One who has plenty of mercy for the believers." },
  { name: "Al-Malik", transliteration: "The Absolute Ruler", meaning: "The One with the complete Dominion, the One Whose Dominion is clear from imperfection." },
  { name: "Al-Quddus", transliteration: "The Pure One", meaning: "The One who is pure from any imperfection and clear from children and adversaries." },
  { name: "As-Salam", transliteration: "The Source of Peace", meaning: "The One who is free from every imperfection." },
  { name: "Al-Mu'min", transliteration: "The Inspirer of Faith", meaning: "The One who witnessed for Himself that no one is God but Him." },
  { name: "Al-Muhaymin", transliteration: "The Guardian", meaning: "The One who witnesses the saying and deeds of His creatures." },
  { name: "Al-Aziz", transliteration: "The Victorious", meaning: "The Defeater who is not defeated." },
  { name: "Al-Jabbar", transliteration: "The Compeller", meaning: "The One that nothing happens in His Dominion except that which He willed." },
  { name: "Al-Mutakabbir", transliteration: "The Greatest", meaning: "The One who is clear from the attributes of the creatures." },
  { name: "Al-Khaliq", transliteration: "The Creator", meaning: "The One who brings everything from non-existence to existence." },
  { name: "Al-Bari'", transliteration: "The Maker of Order", meaning: "The Creator who has the power to turn the entities." },
  { name: "Al-Musawwir", transliteration: "The Shaper of Beauty", meaning: "The One who forms His creatures in different pictures." },
  { name: "Al-Ghaffar", transliteration: "The Forgiving", meaning: "The One who forgives the sins of His slaves time after time." },
  { name: "Al-Qahhar", transliteration: "The Subduer", meaning: "The One who has the perfect power and is not unable over anything." },
  { name: "Al-Wahhab", transliteration: "The Giver of All", meaning: "The One who is Generous in giving without any return." },
  { name: "Ar-Razzaq", transliteration: "The Sustainer", meaning: "The One who provides all things beneficial to His creatures." },
  { name: "Al-Fattah", transliteration: "The Opener", meaning: "The One who opens for His slaves the closed worldly and religious matters." },
  { name: "Al-Alim", transliteration: "The All-Knowing", meaning: "The One who knows everything in the universe." },
  { name: "Al-Qabid", transliteration: "The Constrictor", meaning: "The One who constricts or withholds provisions." },
  { name: "Al-Basit", transliteration: "The Expander", meaning: "The One who expands or provides liberally." },
  { name: "Al-Khafid", transliteration: "The Abaser", meaning: "The One who lowers who He wills by His destruction." },
  { name: "Ar-Rafi", transliteration: "The Exalter", meaning: "The One who raises who He wills by His endowment." },
  { name: "Al-Mu'izz", transliteration: "The Bestower of Honors", meaning: "The One who gives esteem to whoever He wills." },
  { name: "Al-Mudhill", transliteration: "The Humiliator", meaning: "The One who degrades whoever He wills." },
  { name: "As-Sami", transliteration: "The All-Hearing", meaning: "The One who hears all things without an ear." },
  { name: "Al-Basir", transliteration: "The All-Seeing", meaning: "The One who sees all things without an eye." },
  { name: "Al-Hakam", transliteration: "The Judge", meaning: "The One who is the absolute Arbiter." },
  { name: "Al-Adl", transliteration: "The Just", meaning: "The One who is entitled to do what He does." },
  { name: "Al-Latif", transliteration: "The Subtle One", meaning: "The One who is kind to His slaves and gives them what is beneficial." },
  { name: "Al-Khabir", transliteration: "The All-Aware", meaning: "The One who knows the internal truth of things." },
  { name: "Al-Halim", transliteration: "The Forbearing", meaning: "The One who delays the punishment for those who deserve it." },
  { name: "Al-Azim", transliteration: "The Magnificent", meaning: "The One who is greater than everything." },
  { name: "Al-Ghafur", transliteration: "The Forgiving", meaning: "The One who forgives many sins." },
  { name: "Ash-Shakur", transliteration: "The Appreciative", meaning: "The One who gives a lot of reward for a little obedience." },
  { name: "Al-Ali", transliteration: "The Highest", meaning: "The One who is above all in status and attribute." },
  { name: "Al-Kabir", transliteration: "The Greatest", meaning: "The One who is great in status." },
  { name: "Al-Hafiz", transliteration: "The Preserver", meaning: "The One who protects the universe from being destroyed." },
  { name: "Al-Muqit", transliteration: "The Nourisher", meaning: "The One who provides the creatures with their nourishment." },
  { name: "Al-Hasib", transliteration: "The Accounter", meaning: "The One who is sufficient for everyone." },
  { name: "Al-Jalil", transliteration: "The Majestic", meaning: "The One who is attributed with greatness of Power." },
  { name: "Al-Karim", transliteration: "The Bountiful", meaning: "The One who is generous and kind." },
  { name: "Ar-Raqib", transliteration: "The Watchful", meaning: "The One that nothing is absent from Him." },
  { name: "Al-Mujib", transliteration: "The Responsive", meaning: "The One who answers the one in need if he asks Him." },
  { name: "Al-Wasi", transliteration: "The All-Pervading", meaning: "The One whose knowledge and mercy are vast." },
  { name: "Al-Hakim", transliteration: "The Wise", meaning: "The One who is correct in His doings." },
  { name: "Al-Wadud", transliteration: "The Loving", meaning: "The One who loves His believing slaves." },
  { name: "Al-Majid", transliteration: "The Most Glorious", meaning: "The One who is with perfect Power and High Status." },
  { name: "Al-Ba'ith", transliteration: "The Resurrector", meaning: "The One who resurrects the creatures after death." },
  { name: "Ash-Shahid", transliteration: "The Witness", meaning: "The One who is aware of all things." },
  { name: "Al-Haqq", transliteration: "The Truth", meaning: "The One who truly exists." },
  { name: "Al-Wakil", transliteration: "The Trustee", meaning: "The One who gives the satisfaction and is relied upon." },
  { name: "Al-Qawi", transliteration: "The Strong", meaning: "The One with the complete Power." },
  { name: "Al-Matin", transliteration: "The Firm", meaning: "The One with extreme Power which is uninterrupted." },
  { name: "Al-Wali", transliteration: "The Protecting Friend", meaning: "The One who gives support to the believers." },
  { name: "Al-Hamid", transliteration: "The Praiseworthy", meaning: "The One who deserves to be praised." },
  { name: "Al-Muhsi", transliteration: "The Accounter", meaning: "The One who knows the count of everything." },
  { name: "Al-Mubdi", transliteration: "The Originator", meaning: "The One who started the creation." },
  { name: "Al-Mu'id", transliteration: "The Restorer", meaning: "The One who brings back the creatures after death." },
  { name: "Al-Muhyi", transliteration: "The Giver of Life", meaning: "The One who took out a living human from a sperm." },
  { name: "Al-Mumit", transliteration: "The Creator of Death", meaning: "The One who renders the living dead." },
  { name: "Al-Hayy", transliteration: "The Living", meaning: "The One who is attributed with a life that is unlike ours." },
  { name: "Al-Qayyum", transliteration: "The Subsisting", meaning: "The One who remains and does not end or vanish." },
  { name: "Al-Wajid", transliteration: "The Finder", meaning: "The One who does not lack anything." },
  { name: "Al-Majid", transliteration: "The Noble", meaning: "The One who is with broad generosity." },
  { name: "Al-Wahid", transliteration: "The Unique", meaning: "The One who is without a partner." },
  { name: "Al-Ahad", transliteration: "The One", meaning: "The One who is indivisible." },
  { name: "As-Samad", transliteration: "The Eternal", meaning: "The One who is relied upon in matters and reverted to in needs." },
  { name: "Al-Qadir", transliteration: "The Able", meaning: "The One who is attributed with Power." },
  { name: "Al-Muqtadir", transliteration: "The Powerful", meaning: "The One with the perfect Power." },
  { name: "Al-Muqaddim", transliteration: "The Expediter", meaning: "The One who puts things in their right places." },
  { name: "Al-Mu'akhkhir", transliteration: "The Delayer", meaning: "The One who delays what He wills." },
  { name: "Al-Awwal", transliteration: "The First", meaning: "The One whose Existence is without a beginning." },
  { name: "Al-Akhir", transliteration: "The Last", meaning: "The One whose Existence is without an end." },
  { name: "Az-Zahir", transliteration: "The Manifest", meaning: "The One whose Existence is obvious by proofs." },
  { name: "Al-Batin", transliteration: "The Hidden", meaning: "The One who is clear from the delusions of the attributes of bodies." },
  { name: "Al-Wali", transliteration: "The Governor", meaning: "The One who owns things and manages them." },
  { name: "Al-Muta'ali", transliteration: "The Most Exalted", meaning: "The One who is clear from the attributes of the creatures." },
  { name: "Al-Barr", transliteration: "The Source of Goodness", meaning: "The One who is kind to His creatures." },
  { name: "At-Tawwab", transliteration: "The Acceptor of Repentance", meaning: "The One who grants the success to the heart to repent." },
  { name: "Al-Muntaqim", transliteration: "The Avenger", meaning: "The One who victoriously prevails over His enemies." },
  { name: "Al-Afu", transliteration: "The Pardoner", meaning: "The One with wide forgiveness." },
  { name: "Ar-Ra'uf", transliteration: "The Compassionate", meaning: "The One with extreme Mercy." },
  { name: "Malik-ul-Mulk", transliteration: "The Owner of All Sovereignty", meaning: "The One who controls the Dominion and gives dominion to whoever He wills." },
  { name: "Dhu-l-Jalal wa-l-Ikram", transliteration: "The Lord of Majesty and Generosity", meaning: "The One who deserves to be Exalted and not denied." },
  { name: "Al-Muqsit", transliteration: "The Equitable", meaning: "The One who is Just in His judgment." },
  { name: "Al-Jami", transliteration: "The Gatherer", meaning: "The One who gathers the creatures on a day that there is no doubt about." },
  { name: "Al-Ghani", transliteration: "The Self-Sufficient", meaning: "The One who does not need the creatures." },
  { name: "Al-Mughni", transliteration: "The Enricher", meaning: "The One who satisfies the necessities of the creatures." },
  { name: "Al-Mani", transliteration: "The Preventer", meaning: "The One who prevents what He wills from happening." },
  { name: "Ad-Darr", transliteration: "The Distresser", meaning: "The One who makes harm reach whoever He wills." },
  { name: "An-Nafi", transliteration: "The Propitious", meaning: "The One who makes good reach whoever He wills." },
  { name: "An-Nur", transliteration: "The Light", meaning: "The One who guides." },
  { name: "Al-Hadi", transliteration: "The Guide", meaning: "The One with whose Guidance His believers were guided." },
  { name: "Al-Badi", transliteration: "The Incomparable", meaning: "The One who created the universe and devised it without any preceding example." },
  { name: "Al-Baqi", transliteration: "The Everlasting", meaning: "The One that the state of non-existence is impossible for Him." },
  { name: "Al-Warith", transliteration: "The Supreme Inheritor", meaning: "The One whose Existence remains after all creatures perish." },
  { name: "Ar-Rashid", transliteration: "The Guide to the Right Path", meaning: "The One who guides the creatures to what is beneficial for them." },
  { name: "As-Sabur", transliteration: "The Patient", meaning: "The One who does not quickly punish the sinners." }
];

export default function NamesOfAllahView() {
  return (
    <div className="space-y-12">
      <div className="text-center space-y-4 px-4">
        <h3 className="text-2xl md:text-5xl font-black text-white">Asma-ul-Husna</h3>
        <p className="text-sm md:text-lg text-slate-500 font-medium max-w-2xl mx-auto uppercase tracking-widest">The 99 Beautiful Names of Allah</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {NAMES_OF_ALLAH.map((n, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.03 }}
            className="glass-panel p-8 rounded-[2.5rem] border-white/5 hover:border-brand-primary/20 transition-all group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-20 transition-opacity">
              <Sparkles size={40} className="text-brand-primary" />
            </div>
            <div className="space-y-4 relative z-10">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-brand-primary uppercase tracking-[0.4em]">Name {idx + 1}</span>
                <div className="w-8 h-8 rounded-full bg-white/5 border border-white/5 flex items-center justify-center text-slate-500">
                  <Info size={14} />
                </div>
              </div>
              <div>
                <h4 className="text-3xl font-black text-white group-hover:text-brand-primary transition-colors">{n.name}</h4>
                <p className="text-sm font-bold text-slate-400 mt-1">{n.transliteration}</p>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed font-medium pt-4 border-t border-white/5">
                {n.meaning}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="p-12 glass-panel rounded-[3rem] border-brand-primary/10 text-center space-y-6">
        <Sparkles size={48} className="mx-auto text-brand-primary animate-pulse" />
        <h4 className="text-2xl font-black text-white">More Names Coming Soon</h4>
        <p className="text-slate-500 max-w-md mx-auto font-medium">We are adding the remaining names with detailed tafsir and benefits of recitation.</p>
      </div>
    </div>
  );
}
