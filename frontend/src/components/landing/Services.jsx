import { motion } from 'framer-motion';
import { Stethoscope, ScanLine, Microscope, HeartPulse } from 'lucide-react';

const services = [
  {
    name: "Consultation",
    desc: "Rencontre avec nos spécialistes en sénologie pour une évaluation complète.",
    icon: <Stethoscope size={40} className="text-[#EC4899]" />,
    border: "border-[#EC4899]"
  },
  {
    name: "Mammographie",
    desc: "Imagerie médicale haute résolution pour la détection précoce.",
    icon: <ScanLine size={40} className="text-[#0F6FB5]" />,
    border: "border-[#0F6FB5]"
  },
  {
    name: "Diagnostic",
    desc: "Analyse précise et concertation pluridisciplinaire pour un diagnostic fiable.",
    icon: <Microscope size={40} className="text-[#14B8A6]" />,
    border: "border-[#14B8A6]"
  },
  {
    name: "Suivi médical",
    desc: "Accompagnement continu et personnalisé après traitement.",
    icon: <HeartPulse size={40} className="text-[#10B981]" />,
    border: "border-[#10B981]"
  }
];

const Services = () => {
  return (
    <section className="py-24 bg-white font-inter">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="font-poppins font-bold text-4xl text-gray-800 mb-4">Nos Services</h2>
          <p className="text-gray-500 text-lg">Un accompagnement complet à chaque étape</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              whileHover={{ y: -8 }}
              className={`bg-white p-8 rounded-xl shadow-md border-t-4 ${service.border} hover:shadow-xl transition-all cursor-default`}
            >
              <div className="mb-6">{service.icon}</div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">{service.name}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{service.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;