<script setup lang="ts">
import { cn } from '@/lib/utils'
import {
  SwitchRoot,
  type SwitchRootEmits,
  type SwitchRootProps,
  SwitchThumb,
  useForwardPropsEmits,
} from 'radix-vue'
import { computed, type HTMLAttributes, ref, onMounted } from 'vue'
import { Icon } from '@iconify/vue'

const props = defineProps<SwitchRootProps & { class?: HTMLAttributes['class'] }>()
const colorMode = useColorMode()

const emits = defineEmits<SwitchRootEmits>()

const delegatedProps = computed(() => {
  const { class: _, ...delegated } = props
  return delegated
})

const forwarded = useForwardPropsEmits(delegatedProps, emits)

// Ensure preference is properly initialized on mount
const isInitialized = ref(false)

onMounted(() => {
  isInitialized.value = true
})
</script>

<template>
  <SwitchRoot
    v-bind="forwarded"
    v-if="isInitialized"
    :checked="colorMode.preference === 'dark'"
    @update:checked="(checked) => colorMode.preference = checked ? 'dark' : 'light'"
    :class="cn(
      'peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-gray-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-gray-900 data-[state=checked]:border-gray-600 data-[state=checked]:hover:border-rose-400 data-[state=unchecked]:bg-input',
      props.class
    )"
  >
    <SwitchThumb
      :class="cn(
        'pointer-events-none block h-5 w-5 rounded-full shadow-lg ring-0 transition-transform data-[state=checked]:text-white data-[state=checked]:bg-black data-[state=checked]:translate-x-5'
      )"
    >
      <Icon
        :icon="colorMode.preference === 'dark' ? 'radix-icons:moon' : 'radix-icons:sun'"
        :class="['w-4 h-4 transition-all mt-[2px]', {'ml-1' : colorMode.preference === 'light'}, {'ml-[1px]' : colorMode.preference === 'dark'}]"
      />
    </SwitchThumb>
  </SwitchRoot>
</template>
