<template>
  <div class="d-flex align-items-center border rounded p-1 px-2 mb-1" :style="{ 'background-color': bgColour }">
    <span :id="dragHandleId"
          class="handle cursor-move text-secondary"
          draggable="true"
          @dragstart="onDragStart"
          @dragend="onDragEnd">⋮</span>

    <div class="flex-grow-1 ms-2 d-flex flex-column">
      <span :class="{ 'cursor-pointer': !noSelect }" @click="onSelectClick">
        {{ exercise.name }}
      </span>

      <div class="d-flex">
        <div v-if="(exercise.setsRepsText || '').trim() != ''" class="text-secondary text-nowrap" style="font-size: 80%;">({{ exercise.setsRepsText }})</div>
        <div v-if="exercise.durationMinutes" :class="{ 'ps-2': (exercise.setsRepsText || '').trim() != '' } " class="text-secondary text-nowrap" style="font-size: 80%;">{{ exercise.durationMinutes }} mins</div>
      </div>
    </div>

    <span class="ms-2 text-secondary" style="font-size: 70%;">
      <span :style="{ visibility: index > 0 ? 'visible' : 'hidden' }" class="cursor-pointer" @click="$emit('move', -1)">▲</span>
      <span :style="{ visibility: index < totalCount - 1 ? 'visible' : 'hidden' }" class="cursor-pointer" @click="$emit('move', 1)">▼</span>
    </span>
    <span class="text-danger ms-2 cursor-pointer" style="font-size: 70%;" @click="$emit('delete')">🗑</span>
  </div>
</template>

<script>
  import { enumToOptions, BodyPart, ExerciseType, ExerciseIntensity } from '../common/enums';

  export default {
    props: {
      exercise: {
        type: Object,
        required: true
      },

      index: {
        type: Number,
        required: true
      },

      totalCount: {
        type: Number,
        required: true
      },

      dragHandleId: {
        type: String,
        required: true
      },

      noSelect: Boolean
    },

    computed: {
      bgColour() {
        switch (this.exercise.bodyPart) {
          case BodyPart.Legs:
            return '#fcf';
          case BodyPart.Chest:
            return '#fcc';
          case BodyPart.Tricep:
            return '#cfc';
          case BodyPart.UpperBack:
            return '#ccf';
          case BodyPart.LowerBack:
            return '#cff';
          case BodyPart.Shoulders:
            return '#ffc';
          case BodyPart.Wrist:
            return 'rgb(252,229,200)';
          case BodyPart.Elbow:
            return '#ddd';
          default:
            return 'white';
        };
      },
    },

    methods: {
      onDragStart(e) {
        this.$emit('drag-start', e);
      },

      onDragEnd(e) {
        this.$emit('drag-end', e);
      },

      onSelectClick() {
        if (!this.noSelect) {
          this.$emit('select');
        }
      }
    }
  }
</script>