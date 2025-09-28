<template>
  <el-card class="Transaction-card">
    <el-table :data="tableData" style="width: 100%;">
      <el-table-column prop="type" label="Type" width="180"/>
      <el-table-column prop="object" label="Object" width="180"/>
      <el-table-column prop="amount" label="Amount" width="180"/>
      <el-table-column prop="time" label="Time" />
    </el-table>
  </el-card>
</template>

<script setup lang="ts">
const tableData = [
  {
    type: 'Deposits',
    object: '',
    amount: '0.5 ETH',
    time: '9/28/2025, 10:00:35 AM',
  },
  {
    type: 'Deposits',
    object: '',
    amount: '0.5 ETH',
    time: '9/28/2025, 10:00:35 AM',
  },
  {
    type: 'Deposits',
    object: '',
    amount: '0.5 ETH',
    time: '9/28/2025, 10:00:35 AM',
  },
  {
    type: 'Deposits',
    object: '',
    amount: '0.5 ETH',
    time: '9/28/2025, 10:00:35 AM',
  },
  {
    type: 'Deposits',
    object: '',
    amount: '0.5 ETH',
    time: '9/28/2025, 10:00:35 AM',
  },
  {
    type: 'Deposits',
    object: '',
    amount: '0.5 ETH',
    time: '9/28/2025, 10:00:35 AM',
  },
  
]
</script>

<style scoped>

</style>
