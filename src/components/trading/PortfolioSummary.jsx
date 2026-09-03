"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Wallet, PieChart } from "lucide-react";
import { useMarket } from "@/lib/MarketProvider";
import { formatCurrency, formatSigned, formatSignedCurrency, STARTING_CASH } from "@/lib/market";
import AnimatedNumber from "./AnimatedNumber";
import Sparkline from "./Sparkline";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09 } },
};
const item = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" } },
};

function StatCard({ icon: Icon, label, value, accent }) {
  return (
    <motion.div
      variants={item}
      className="rounded-2xl border border-hairline bg-navy/50 p-5 backdrop-blur-md"
    >
      <div className="flex items-center gap-2 text-mist">
        <Icon className="h-3.5 w-3.5" strokeWidth={1.75} />
        <span className="text-xs uppercase tracking-wider">{label}</span>
      </div>
      <div className={`mt-2 font-mono text-2xl font-variant-tabular ${accent ?? "text-porcelain"}`}>
        {value}
      </div>
    </motion.div>
  );
}

export default function PortfolioSummary() {
  const { equity, cash, holdingsValue, equityHistory } = useMarket();

  const totalReturn = equity - STARTING_CASH;
  const totalReturnPct = (totalReturn / STARTING_CASH) * 100;
  const isUp = totalReturn >= 0;

  return (
    <motion.div
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.3 }}
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]"
    >
      <motion.div
        variants={item}
        className="relative overflow-hidden rounded-2xl border border-hairline bg-navy/50 p-6 backdrop-blur-md lg:row-span-1"
      >
        <div className="flex items-start justify-between">
          <div>
            <span className="text-xs uppercase tracking-wider text-mist">Total equity</span>
            <div className="mt-1 font-mono text-4xl font-semibold font-variant-tabular text-porcelain">
              <AnimatedNumber value={equity} format={(v) => formatCurrency(v)} />
            </div>
            <div
              className={`mt-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                isUp ? "bg-cyan/10 text-cyan" : "bg-crimson/10 text-crimson"
              }`}
            >
              {isUp ? (
                <TrendingUp className="h-3 w-3" strokeWidth={2} />
              ) : (
                <TrendingDown className="h-3 w-3" strokeWidth={2} />
              )}
              {formatSignedCurrency(totalReturn)} ({formatSigned(totalReturnPct, { suffix: "%" })}) since inception
            </div>
          </div>
          <Sparkline
            data={equityHistory}
            width={140}
            height={56}
            color={isUp ? "#00f0ff" : "#ff2a5f"}
            className="hidden shrink-0 sm:block"
          />
        </div>
      </motion.div>

      <StatCard icon={Wallet} label="Cash balance" value={formatCurrency(cash, { compact: true })} />
      <StatCard icon={PieChart} label="Holdings value" value={formatCurrency(holdingsValue, { compact: true })} />
      <StatCard
        icon={isUp ? TrendingUp : TrendingDown}
        label="Total return"
        value={formatSigned(totalReturnPct, { suffix: "%" })}
        accent={isUp ? "text-cyan" : "text-crimson"}
      />
    </motion.div>
  );
}
