<script setup lang="ts">
const props = defineProps({
    show: Boolean
})

const emit = defineEmits(['update:show']);


</script>
<template>
    <q-dialog v-model="show">
        <q-card>

        </q-card>
    </q-dialog>
</template>
<style lang="scss">

</style>