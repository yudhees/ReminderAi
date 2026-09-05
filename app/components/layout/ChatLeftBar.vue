<template>
    <div ref="menuRef" class="group relative z-[100] mx-2 mb-2 overflow-visible">
        <NuxtLink :to="{ name: 'chat-id', params: { id: chatId } }"
            class="flex items-start gap-2.5 rounded-lg px-3 py-2.5 pr-12 transition-colors hover:bg-[#1c1c38] cursor-pointer"
            :class="{
                'bg-[#1c1c38] border-l-2 border-indigo-500 ml-0': active
            }">
            <div class="min-w-0">
                <div class="truncate text-[13px] font-semibold" v-if="!isRename">{{ heading }}</div>
                <input 
                    v-else 
                    ref="renameInput"
                    v-model="editedName"
                    @blur="saveRename"
                    @keydown.enter="saveRename"
                    @keydown.esc="cancelRename"
                    @click.stop
                    class="w-full bg-[#1c1c38] text-white text-[13px] font-semibold px-2 py-1 rounded outline-none"
                />
                <div class="mt-0.5 text-[11px] text-slate-500">{{ formattedTime }}</div>
            </div>
        </NuxtLink>

        <div class="absolute right-2 top-1/2 z-20 -translate-y-1/2">
            <div class="relative z-20" ref="dropDownContainer">
                <button ref="buttonRef" type="button" @click.stop="toggleMenu"
                    class="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-[#2a2a4d] hover:text-white"
                    aria-label="Chat actions">
                    <svg viewBox="0 0 24 24" class="h-4 w-4 fill-current" aria-hidden="true">
                        <circle cx="12" cy="5" r="1.8" />
                        <circle cx="12" cy="12" r="1.8" />
                        <circle cx="12" cy="19" r="1.8" />
                    </svg>
                </button>

                <Teleport to="body">
                    <div ref="dropdownRef" v-if="isMenuOpen"
                        class="fixed z-[9999] min-w-[150px] rounded-lg border border-slate-700 bg-[#14142d] p-1 shadow-lg"
                        :style="dropdownPosition">
                        <button type="button" @click="startRename"
                            class="flex w-full items-center rounded-md px-2 py-1.5 text-left text-sm text-slate-200 transition hover:bg-[#1c1c38]">
                            Rename
                        </button>
                        <button type="button" @click="$emit('delete')"
                            class="flex w-full items-center rounded-md px-2 py-1.5 text-left text-sm text-red-300 transition hover:bg-red-500/10">
                            Delete
                        </button>
                    </div>
                </Teleport>
            </div>
        </div>
    </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref, computed, watch, nextTick } from 'vue'
import moment from 'moment'
import { useToggle } from '@vueuse/core'

const [isRename, toggleRename] = useToggle(false)
const props = defineProps({
    heading: { default: "" },
    chatId: { default: "" },
    active: { default: false },
    remind_time: { default: "" }
})

const emit = defineEmits(['rename','isRenameOpen','delete'])

const isMenuOpen = ref(false)
const menuRef = ref(null)
const dropDownContainer = ref(null)
const buttonRef = ref(null)
const dropdownRef = ref(null)
const dropdownPosition = ref({ top: '0px', left: '0px' })
const renameInput = ref(null)
const editedName = ref('')
let rafId = null

const formattedTime = computed(() => {
    if (!props.remind_time) return ''
    
    const reminderDate = moment(props.remind_time)
    const now = moment()
    
    if (reminderDate.isSame(now, 'day')) {
        return reminderDate.format('h:mm A')
    } else if (reminderDate.isSame(now.clone().subtract(1, 'day'), 'day')) {
        return `Yesterday ${reminderDate.format('h:mm A')}`
    } else if (reminderDate.isSame(now.clone().add(1, 'day'), 'day')) {
        return `Tomorrow ${reminderDate.format('h:mm A')}`
    } else {
        return reminderDate.format('DD MMM YY')
    }
})

const closeRename=()=>{
    emit("isRenameOpen",false)
    isRename.value=false
}
const startRename = () => {
    emit("isRenameOpen",true)
    editedName.value = props.heading
    isRename.value = true
    isMenuOpen.value = false
    stopPositionUpdates()
    nextTick(() => {
        if (renameInput.value) {
            renameInput.value.focus()
            renameInput.value.select()
        }
    })
}

const saveRename = () => {
    if (editedName.value.trim() && editedName.value !== props.heading) {
        emit('rename',editedName.value.trim() )
    }
    closeRename()
}

const cancelRename = () => {
    editedName.value = props.heading
    closeRename()
}

const toggleMenu = () => {
    isMenuOpen.value = !isMenuOpen.value
    if (isMenuOpen.value && buttonRef.value) {
        updateDropdownPosition()
        startPositionUpdates()
    } else {
        stopPositionUpdates()
    }
}

const updateDropdownPosition = () => {
    if (buttonRef.value) {
        const rect = buttonRef.value.getBoundingClientRect()
        dropdownPosition.value = {
            top: `${rect.bottom + 4}px`,
            right: `${window.innerWidth - rect.right}px`
        }
    }
}

const startPositionUpdates = () => {
    if (rafId) return
    const update = () => {
        updateDropdownPosition()
        rafId = requestAnimationFrame(update)
    }
    rafId = requestAnimationFrame(update)
}

const stopPositionUpdates = () => {
    if (rafId) {
        cancelAnimationFrame(rafId)
        rafId = null
    }
}

const closeMenu = (event) => {
    if (menuRef.value && !menuRef.value.contains(event.target) && dropdownRef.value && !dropdownRef.value.contains(event.target)) {
        isMenuOpen.value = false
        stopPositionUpdates()
    }
}

onClickOutside(dropDownContainer,()=>{
    isMenuOpen.value=false
})
onMounted(() => {
    document.addEventListener('click', closeMenu)
})

onBeforeUnmount(() => {
    document.removeEventListener('click', closeMenu)
    stopPositionUpdates()
})
</script>