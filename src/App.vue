<template>
    <el-input v-model="addr" placeholder="Please input Wallet address"></el-input>
    <Balance />
    <TokenizedAssets />
    <Transaction />
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import Balance from './components/Balance.vue';
import TokenizedAssets from './components/Tokenized Assets.vue';
import Transaction from './components/Transaction.vue';
import { useWallet } from './composable/useWallet';

const addr = ref('');
const { setAddress } = useWallet();

watch(addr, (newAddress) => {
  setAddress(newAddress);
});


</script>

<style scoped></style>
