'use client';

import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  ArrowRight,
  Sparkles,
  Refrigerator,
  Wind,
  Handshake,
  Award,
  Github,
  Lightbulb,
  Users,
  MessageCircle,
  Target,
} from 'lucide-react';
import { useRef } from 'react';

const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.08 } },
};

function Section({
  children,
  className = '',
  id,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section
      id={id}
      className={`relative w-full px-6 py-20 md:px-12 md:py-28 ${className}`}
    >
      <div className="mx-auto w-full max-w-5xl">{children}</div>
    </section>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[12px] font-semibold uppercase tracking-[0.2em] text-rose-500">
      {children}
    </p>
  );
}

function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [0, -60]);

  return (
    <section
      ref={ref}
      className="relative flex min-h-screen w-full items-center overflow-hidden bg-gradient-to-br from-rose-50 via-amber-50 to-rose-100 px-6 md:px-12"
    >
      <div className="pointer-events-none absolute -right-24 -top-24 h-[420px] w-[420px] rounded-full bg-rose-300/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -left-24 h-[420px] w-[420px] rounded-full bg-amber-300/30 blur-3xl" />

      <motion.div
        style={{ y }}
        initial="hidden"
        animate="visible"
        variants={stagger}
        className="relative mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-12 md:grid-cols-2"
      >
        <div>
          <motion.div
            variants={fadeInUp}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-white/70 px-3 py-1 text-[12px] font-medium text-rose-600 backdrop-blur"
          >
            <Sparkles className="h-3.5 w-3.5" />
            邻食 · OPC 协作平台
          </motion.div>

          <motion.h1
            variants={fadeInUp}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="mt-5 text-[40px] font-bold leading-[1.1] text-neutral-900 md:text-[64px]"
          >
            让脑子里那张 idea，
            <br />
            <span className="bg-gradient-to-r from-rose-500 to-amber-500 bg-clip-text text-transparent">
              自己找到能拼桌的人
            </span>
          </motion.h1>

          <motion.p
            variants={fadeInUp}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="mt-5 max-w-xl text-[16px] leading-relaxed text-neutral-600 md:text-[18px]"
          >
            OPC（一到十人的小协作团体）把想做的事变成 idea 卡，扔进灵感冰箱。到点 AI agent 主动出门，
            跨用户找另一张能跟它配的 idea，撮合一桌真正的协作。
          </motion.p>

          <motion.div
            variants={fadeInUp}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="mt-8 flex flex-wrap items-center gap-3"
          >
            <Link
              href="/fridge/inside?demo=1"
              className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-rose-500 to-amber-500 px-6 py-3 text-[15px] font-semibold text-white shadow-lg shadow-rose-300/40 transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              看一遍 3 分钟演示
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="https://github.com/yorkie-owl/NF"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-neutral-300 bg-white/80 px-5 py-3 text-[14px] font-medium text-neutral-700 backdrop-blur transition-colors hover:bg-white"
            >
              <Github className="h-4 w-4" />
              GitHub
            </Link>
          </motion.div>

          <motion.div
            variants={fadeInUp}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="mt-10 flex items-center gap-4 text-[12px] text-neutral-500"
          >
            <span className="inline-flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              黑客松路演 · 2026
            </span>
            <span className="text-neutral-300">·</span>
            <span>Next.js 15 + React 19 + LangGraph</span>
          </motion.div>
        </div>

        {/* Right: floating idea-card visual */}
        <motion.div
          variants={fadeInUp}
          transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
          className="relative hidden md:block"
        >
          <div className="relative mx-auto h-[420px] w-[320px] rounded-[40px] bg-gradient-to-br from-white to-rose-50 p-6 shadow-2xl shadow-rose-300/30 ring-1 ring-rose-100">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-rose-400">
              我的灵感冰箱
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2.5">
              {[
                { e: '💡', n: '咖啡馆 MVP', restless: 96 },
                { e: '🧱', n: 'React 全栈', restless: 78 },
                { e: '🎙️', n: '周更播客', restless: 45 },
                { e: '🔪', n: '锋利文案', restless: 62 },
                { e: '🌾', n: '社区运营', restless: 30 },
                { e: '🛡️', n: '危机公关', restless: 88 },
              ].map((c, i) => (
                <motion.div
                  key={c.n}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 + i * 0.08, duration: 0.4 }}
                  className="relative aspect-square rounded-2xl bg-white p-2 text-center shadow-md ring-1 ring-rose-100"
                >
                  <div className="text-2xl">{c.e}</div>
                  <div className="mt-1 truncate text-[9px] font-medium text-neutral-600">{c.n}</div>
                  {c.restless >= 95 ? (
                    <span className="absolute -right-1 -top-1 rounded-full bg-rose-500 px-1.5 py-0.5 text-[8px] font-bold text-white">
                      出走
                    </span>
                  ) : null}
                </motion.div>
              ))}
            </div>
            <div className="mt-5 rounded-2xl bg-gradient-to-br from-violet-50 to-rose-50 p-3 ring-1 ring-violet-200/50">
              <div className="flex items-start gap-2">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-violet-500">
                  <Sparkles className="h-3.5 w-3.5 text-white" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold text-violet-700">局长助理</p>
                  <p className="mt-0.5 text-[10px] leading-relaxed text-neutral-700">
                    💡 咖啡馆 MVP 找到 🧱 React 全栈，可以拼一桌
                  </p>
                </div>
              </div>
            </div>
          </div>
          {/* floating idea hint */}
          <motion.div
            initial={{ x: 0, y: 0, opacity: 0 }}
            animate={{ x: 80, y: -40, opacity: [0, 1, 0] }}
            transition={{ duration: 3, repeat: Infinity, repeatDelay: 1, ease: 'easeOut' }}
            className="absolute right-0 top-12 rounded-2xl bg-white px-3 py-1.5 shadow-lg ring-2 ring-rose-200"
          >
            <span className="text-xl">💡</span>
            <span className="ml-1 text-[10px] font-medium text-rose-500">出走中…</span>
          </motion.div>
        </motion.div>
      </motion.div>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[11px] text-neutral-400">
        ↓ 往下滚
      </div>
    </section>
  );
}

function ProblemSection() {
  return (
    <Section className="bg-white">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        variants={stagger}
      >
        <motion.div variants={fadeInUp} transition={{ duration: 0.6 }}>
          <Eyebrow>OPC 的真问题</Eyebrow>
          <h2 className="mt-3 text-[28px] font-bold leading-tight text-neutral-900 md:text-[40px]">
            一个人到十个人的小团体，
            <br />
            <span className="text-neutral-500">至今没有真正属于自己的协作工具。</span>
          </h2>
        </motion.div>

        <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-3">
          {[
            {
              icon: Lightbulb,
              title: 'idea 没人接',
              body: '想做点什么，但开口前先要找人——朋友圈群发、咖啡见面，效率低得像 1990 年代。',
            },
            {
              icon: Users,
              title: '找队友靠转发',
              body: '没有结构化的能力清单和场景标签，全靠人脑匹配。两个能拼桌的人擦肩而过是常态。',
            },
            {
              icon: MessageCircle,
              title: '协作起来缺局长',
              body: '凑齐了人不等于会协作。破冰、第一周里程碑、复盘——这些 OPC 没人主动张罗。',
            },
          ].map((p) => (
            <motion.div
              key={p.title}
              variants={fadeInUp}
              transition={{ duration: 0.6 }}
              className="rounded-2xl bg-gradient-to-br from-neutral-50 to-white p-6 ring-1 ring-neutral-200"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 text-rose-600">
                <p.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-[18px] font-semibold text-neutral-900">{p.title}</h3>
              <p className="mt-2 text-[14px] leading-relaxed text-neutral-600">{p.body}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </Section>
  );
}

function FlowSection() {
  const steps = [
    { icon: Refrigerator, title: '上架', body: '把想做的事敲成 idea 卡，扔进灵感冰箱，打风格 + 场景标签。' },
    { icon: Target, title: '躁动', body: '每张卡有保鲜期。到点进度环涨满，卡片轻抖——它要出门了。' },
    { icon: Wind, title: '离家出走', body: 'AI agent 接手卡片，跨用户搜索能拼桌的另一张 idea + 它背后的人。' },
    { icon: Handshake, title: '拼桌成局', body: '一键立局，凑齐人 → FORMED → 自动开局内协作面板。' },
    { icon: Award, title: '推局成功', body: '局长助理给破冰题、第一周里程碑、复盘卡 + 颁发"首桌成局"冰箱贴。' },
  ];
  return (
    <Section className="bg-gradient-to-b from-rose-50/40 via-white to-amber-50/40">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        variants={stagger}
      >
        <motion.div variants={fadeInUp} transition={{ duration: 0.6 }}>
          <Eyebrow>5 步剧本</Eyebrow>
          <h2 className="mt-3 text-[28px] font-bold leading-tight text-neutral-900 md:text-[40px]">
            我们让 idea 自己出门去找队友
          </h2>
          <p className="mt-3 max-w-2xl text-[15px] text-neutral-600 md:text-[17px]">
            从你扔进冰箱那一刻起，到一桌真正的协作完成，全程只需要 5 步——其中 3 步是 AI agent 自己跑的。
          </p>
        </motion.div>

        <ol className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-5 md:gap-3">
          {steps.map((s, i) => (
            <motion.li
              key={s.title}
              variants={fadeInUp}
              transition={{ duration: 0.5 }}
              className="relative rounded-2xl bg-white p-5 shadow-sm ring-1 ring-neutral-100"
            >
              <div className="text-[10px] font-semibold uppercase tracking-wider text-rose-400">
                STEP {i + 1}
              </div>
              <div className="mt-2 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-rose-100 to-amber-100 text-rose-600">
                <s.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-3 text-[16px] font-bold text-neutral-900">{s.title}</h3>
              <p className="mt-1.5 text-[13px] leading-relaxed text-neutral-600">{s.body}</p>
            </motion.li>
          ))}
        </ol>
      </motion.div>
    </Section>
  );
}

function AgentSection() {
  return (
    <Section className="bg-gradient-to-br from-violet-50 via-white to-rose-50">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        variants={stagger}
      >
        <motion.div variants={fadeInUp} transition={{ duration: 0.6 }}>
          <Eyebrow>AI agent</Eyebrow>
          <h2 className="mt-3 text-[28px] font-bold leading-tight text-neutral-900 md:text-[40px]">
            局长助理：你的 OPC 同事
          </h2>
          <p className="mt-3 max-w-2xl text-[15px] text-neutral-600 md:text-[17px]">
            不是聊天机器人。它有 3 件具体的事要做——而且在桌上一直在。
          </p>
        </motion.div>

        <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-3">
          {[
            {
              tag: '出门',
              title: '匹配拼桌',
              body: '用 LangGraph 跨用户搜 idea 池，输出 matchScore + 拟人理由 + 建议饭局题目。',
            },
            {
              tag: '入桌',
              title: '5 分钟破冰',
              body: '基于三方 idea 自动出 3 个破冰题，让协作伙伴第一次见面就直接谈到点子上。',
            },
            {
              tag: '推进',
              title: '里程碑 + 复盘',
              body: '第一周给一个最小可交付里程碑；局结束自动出复盘卡 + 颁发"首桌成局"冰箱贴。',
            },
          ].map((c) => (
            <motion.div
              key={c.title}
              variants={fadeInUp}
              transition={{ duration: 0.6 }}
              className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-violet-100"
            >
              <div className="inline-flex items-center gap-1.5 rounded-full bg-violet-100 px-2.5 py-0.5 text-[11px] font-semibold text-violet-700">
                <Sparkles className="h-3 w-3" />
                {c.tag}
              </div>
              <h3 className="mt-4 text-[18px] font-bold text-neutral-900">{c.title}</h3>
              <p className="mt-2 text-[14px] leading-relaxed text-neutral-600">{c.body}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </Section>
  );
}

function DemoCtaSection() {
  return (
    <Section className="bg-neutral-950 text-white">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.7 }}
        className="text-center"
      >
        <Eyebrow>现在就看</Eyebrow>
        <h2 className="mt-3 text-[32px] font-bold leading-tight md:text-[48px]">
          3 分钟演示，全程交互
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-neutral-400 md:text-[17px]">
          按 → 切帧，全程半手动控节奏。第 3 帧 idea 真的飞出冰箱，agent 真的在思考；
          第 5 帧自动跳到 COMPLETED 活动详情看局长助理 + 复盘卡。
        </p>
        <Link
          href="/fridge/inside?demo=1"
          className="group mt-10 inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-rose-500 to-amber-500 px-8 py-4 text-[16px] font-semibold text-white shadow-2xl shadow-rose-500/30 transition-transform hover:scale-[1.03] active:scale-[0.97]"
        >
          打开 demo
          <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
        </Link>
        <p className="mt-4 text-[12px] text-neutral-500">
          打开后按 → 或屏幕右下红色 chevron 切帧
        </p>
      </motion.div>
    </Section>
  );
}

function FooterSection() {
  return (
    <footer className="bg-neutral-50 px-6 py-12 md:px-12">
      <div className="mx-auto flex max-w-5xl flex-col items-start justify-between gap-6 md:flex-row md:items-center">
        <div>
          <p className="text-[14px] font-semibold text-neutral-900">邻食 · OPC 协作平台</p>
          <p className="mt-1 text-[12px] text-neutral-500">
            Next.js 15 · React 19 · LangGraph · TailwindCSS 4 · Framer Motion
          </p>
        </div>
        <div className="flex items-center gap-3 text-[12px] text-neutral-600">
          <Link
            href="https://github.com/yorkie-owl/NF"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full border border-neutral-300 px-3 py-1.5 hover:bg-white"
          >
            <Github className="h-3.5 w-3.5" />
            yorkie-owl/NF
          </Link>
          <Link
            href="/fridge/inside?demo=1"
            className="rounded-full bg-rose-500 px-3 py-1.5 font-semibold text-white hover:bg-rose-600"
          >
            打开 demo →
          </Link>
        </div>
      </div>
    </footer>
  );
}

export default function IntroPage() {
  // /intro is rendered without the phone-frame wrapper (LayoutShell branches on pathname).
  // Plain block flow gives the landing the full browser viewport.
  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-white">
      <Hero />
      <ProblemSection />
      <FlowSection />
      <AgentSection />
      <DemoCtaSection />
      <FooterSection />
    </div>
  );
}
