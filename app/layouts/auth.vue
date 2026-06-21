<template>
    <div style="
      background: radial-gradient(ellipse at 50% 40%, #1e1b4b 0%, #0f0f13 70%);
    " class="flex items-center justify-center h-screen">
        <div
            class="flex flex-col items-center gap-7 p-12 w-[380px] bg-[#13131e] border border-white/5 rounded-3xl shadow-2xl text-center">
            <div
                class="w-18 h-18 w-[72px] h-[72px] rounded-[20px] bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-4xl shadow-[0_0_50px_rgba(99,102,241,0.35)]">
                ⏰
            </div>
            <div>
                <h1 class="text-3xl font-extrabold tracking-tight">Reminza</h1>
                <p class="text-slate-400 text-[15px] mt-1">
                    Your AI-powered reminder assistant
                </p>
            </div>
            <div class="flex gap-4 w-full">
                <div
                    class="flex-1 bg-[#1a1a28] border border-white/5 rounded-xl p-3.5 text-center text-xs text-slate-400">
                    <div class="text-2xl mb-1.5">🤖</div>
                    <div class="text-slate-300 font-semibold text-[13px] mb-0.5">AI Chat</div>
                    Set reminders naturally
                </div>
                <div
                    class="flex-1 bg-[#1a1a28] border border-white/5 rounded-xl p-3.5 text-center text-xs text-slate-400">
                    <div class="text-2xl mb-1.5">🎤</div>
                    <div class="text-slate-300 font-semibold text-[13px] mb-0.5">Voice</div>
                    Just speak it aloud
                </div>
                <div
                    class="flex-1 bg-[#1a1a28] border border-white/5 rounded-xl p-3.5 text-center text-xs text-slate-400">
                    <div class="text-2xl mb-1.5">🔔</div>
                    <div class="text-slate-300 font-semibold text-[13px] mb-0.5">Smart</div>
                    Never miss anything
                </div>
            </div>
            <hr class="w-full border-white/5" />

            <slot></slot>
            <!-- <p class="text-slate-600 text-xs">By continuing you agree to our
                <a href="8_terms.html" class="text-indigo-400 hover:underline">Terms</a> &amp;
                <a href="8_terms.html" class="text-indigo-400 hover:underline">Privacy Policy</a>
            </p> -->
        </div>
    </div>
</template>
