﻿<template>
  <div class="app" style="font-size: 85%;">
    <div class="d-flex">
      <div class="flex-grow-1 p-3 d-flex">

        <!-- Exercises List -->
        <div class="border rounded p-2" style="max-height: 95vh; overflow: auto;" :style="{ 'background-color': bgVeryLightGray }">
          <h5>Exercises</h5>
          <template v-if="exercises.length == 0">
            <i>No exercises are defined</i>
          </template>
          <template v-else>
            <Exercise v-for="(exercise, index) in exercises"
                      :key="exercise.id"
                      :exercise="exercise"
                      :index="index"
                      :totalCount="exercises.length"
                      :dragHandleId="`exercise-handle-${exercise.id}`"
                      :class="{ 'border-primary': addEditExercise && addEditExercise.id == exercise.id }"
                      @drag-start="dragStartHandler"
                      @drag-end="dragEndHandler"
                      @edit="onEditExercise(exercise.id)"
                      @move="moveExercise(index, $event)"
                      @delete="onDeleteExerciseClick(exercise.id)">
            </Exercise>
          </template>
          <div class="mt-3">
            <button class="btn btn-primary" @click="onAddNewExerciseClick">Add New</button>
          </div>
        </div>

        <!-- Workout Add/Edit -->
        <div class="border rounded p-2 ms-2">
          <h5>Workouts</h5>
          <template v-if="workouts.length == 0">
            <i>No workouts are defined</i>
          </template>
          <template v-else>
            <div class="d-flex">
              <div class="flex-fill">
                <label>Select a workout</label>
                <BFormSelect :options="workoutsOptions" v-model="selectedWorkoutId" @input="onWorkoutSelected" />
              </div>
              <div v-if="addEditWorkout" class="flex-fill ms-3">
                <label>Workout name</label>
                <BFormInput id="exercise-name" v-model="addEditWorkout.name" placeholder="Name" />
              </div>
            </div>
          </template>

          <div v-if="!addEditWorkout" class="mt-3">
            <button class="btn btn-primary" @click="onAddNewWorkoutClick">Add New</button>
          </div>

          <div v-if="addEditWorkout" class="mt-3">
            <div class="d-flex border rounded p-2">
              <template v-if="(addEditWorkout.days || []).length == 0">
                <i>No days are defined</i>
              </template>
              <template v-else>
                <!-- Workout Days Loop -->
                <div v-for="(workoutDay, dayIndex) in addEditWorkout.days" :key="dayIndex" class="border rounded m-1 p-1" :style="{ 'background-color': bgVeryLightGray }">
                  <h6>Day {{ dayIndex + 1 }}</h6>

                  <WorkoutDaySummary v-if="(workoutDay.exercises || []).length > 0"
                                     :exercisesMap="exercisesMap"
                                     :dayExerciseIds="workoutDay.exercises"
                                     class="text-secondary"
                                     style="font-size: 80%;" />

                  <div :id="`workout-day-${dayIndex}`"
                       class="drop-zone border rounded m-1 p-1 bg-white"
                       @drop="workoutDayExercisesDropHandler"
                       @dragover="workoutDayExercisesDragOverHandler">
                    <template v-if="(workoutDay.exercises || []).length == 0">
                      <i>No exercises</i>
                    </template>

                    <Exercise v-for="(exerciseId, exerciseIndex) in workoutDay.exercises"
                              :key="exerciseId"
                              :exercise="exercisesMap[exerciseId]"
                              :index="exerciseIndex"
                              :totalCount="workoutDay.exercises.length"
                              :dragHandleId="`workout-exercise-handle-${exerciseId}`"
                              no-edit
                              @drag-start="dragStartHandler"
                              @drag-end="dragEndHandler"
                              @move="moveWorkoutDayExercise(dayIndex, exerciseIndex, $event)"
                              @delete="onDeleteWorkoutExerciseClick(dayIndex, exercisesMap[exerciseId].id)">
                    </Exercise>
                  </div>

                  <div class="d-flex justify-content-center">
                    <span class="text-danger ms-1 cursor-pointer" @click="onDeleteWorkoutDayClick(dayIndex)">🗑</span>
                  </div>
                </div>
              </template>
            </div>

            <div class="mt-3">
              <button class="btn btn-info btn-sm" @click="onAddNewDayToWorkoutClick">Add New Day to Workout</button>
            </div>

            <div class="mt-5 d-flex">
              <button class="btn btn-primary" @click="onSaveWorkoutClick">Save</button>
              <button class="btn btn-warning ms-2" @click="addEditWorkout = null">Cancel</button>
              <button class="btn btn-success ms-auto" @click="onBackupClick">Backup</button>
            </div>
          </div>
        </div>

      </div>

      <div v-if="addEditExercise" class="p-3 border border-right-0 border-bottom-0 border-top-0">
        <h5>{{ addEditExercise.id ? 'Edit' : 'Add New' }} Exercise</h5>
        <div>
          <label>Name</label>
          <BFormInput v-model="addEditExercise.name" placeholder="Name" />
        </div>
        <div class="mt-2">
          <label>Body Part</label>
          <BFormSelect :options="enumToOptions(BodyPart)" v-model="addEditExercise.bodyPart" />
        </div>
        <div class="mt-2">
          <label>Type</label>
          <BFormSelect :options="enumToOptions(ExerciseType)" v-model="addEditExercise.type" />
        </div>
        <div class="mt-2">
          <label>Duration (minutes)</label>
          <BFormInput v-model="addEditExercise.durationMinutes" placeholder="Duration (minutes)" />
        </div>
        <div class="mt-2">
          <label>Sets & Reps (text)</label>
          <BFormInput v-model="addEditExercise.setsRepsText" placeholder="Sets & Reps" />
        </div>
        <div class="mt-2">
          <label>Intensity</label>
          <BFormSelect :options="enumToOptions(ExerciseIntensity)" v-model="addEditExercise.intensity" />
        </div>
        <div class="mt-2">
          <label>Notes</label>
          <BFormTextarea id="textarea"
                         v-model="addEditExercise.notes"
                         placeholder="Notes"
                         rows="3"
                         max-rows="6" />
        </div>
        <div class="mt-3">
          <button class="btn btn-primary" @click="onSaveExerciseClick">Save</button>
          <button class="btn btn-warning ms-2" @click="addEditExercise = null">Cancel</button>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
  import { toRaw } from 'vue';
  import fileDownload from 'js-file-download';

  import { enumToOptions, BodyPart, ExerciseType, ExerciseIntensity } from './common/enums';

  import Exercise from './components/Exercise.vue';
  import WorkoutDaySummary from './components/WorkoutDaySummary.vue';

  function getCurrentTimestamp() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    return `${year}${month}${day}_${hours}${minutes}${seconds}`;
  }

  export default {
    components: {
      Exercise,
      WorkoutDaySummary
    },

    data() {
      return {
        exercises: [],
        addEditExercise: null,
        workouts: [],
        addEditWorkout: null,
        selectedWorkoutId: null,
        enumToOptions,
        BodyPart,
        ExerciseType,
        ExerciseIntensity,
        bgVeryLightGray: '#f8f8f8'
      };
    },

    computed: {
      exercisesMap() {
        return this.exercises.toDictionary(x => x.id, x => x);
      },

      workoutsOptions() {
        return this.workouts.map(x => ({ value: x.id, text: x.name }));
      }
    },

    created() {
      const exercises = window.localStorage.getItem('atg-exercises');

      if (exercises) {
        this.exercises = JSON.parse(exercises);
      }

      const workouts = window.localStorage.getItem('atg-workouts');

      if (workouts) {
        this.workouts = JSON.parse(workouts);
      }

      const lastWorkoutId = window.localStorage.getItem('atg-last-workout-id');

      if (lastWorkoutId && this.workouts.findIndex(x => x.id == +lastWorkoutId) != -1) {
        this.selectedWorkoutId = +lastWorkoutId;
        this.onWorkoutSelected(+lastWorkoutId);
      }

      document.addEventListener('keydown', this.onKeyDown);
    },

    onBeforeDestroy() {
      document.removeEventListener('keydown', this.onKeyDown);
    },

    methods: {
      moveExercise(currentIndex, step) {
        const [element] = this.exercises.splice(currentIndex, 1);
        this.exercises.splice(currentIndex + step, 0, element);
        this.saveExercises();
      },

      moveWorkoutDayExercise(dayIndex, currentIndex, step) {
        const [element] = this.addEditWorkout.days[dayIndex].exercises.splice(currentIndex, 1);
        this.addEditWorkout.days[dayIndex].exercises.splice(currentIndex + step, 0, element);
        this.saveWorkouts();
      },

      dragStartHandler(e) {
        this._dragSourceId = e.target.id;
      },

      dragEndHandler() {
        delete this._dragSourceId;

        if (this._lastDropZone) {
          this._lastDropZone.classList.remove('cursor-not-allowed');
          delete this._lastDropZone;
        }
      },

      getIsDropAllowed(e) {
        let dropzone = e.target;

        while (!dropzone.classList.contains('drop-zone')) {
          dropzone = dropzone.parentElement;

          if (dropzone == document.body) {
            break;
          }
        }

        if (dropzone == document.body) {
          return { isAllowed: false };
        }

        this._lastDropZone = dropzone;

        let isAllowed = false;
        const relevantSourceEntityId = this._dragSourceId ? +this._dragSourceId.split('-').last() : undefined;

        if (this._dragSourceId?.startsWith('exercise-')) {
          const dayIndex = +dropzone.id.split('-').last();
          isAllowed = !(this.addEditWorkout.days[dayIndex].exercises ?? []).includes(relevantSourceEntityId);
        }
        else if (this._dragSourceId?.startsWith('workout-exercise-')) {
          const dayIndex = +dropzone.id.split('-').last();
          isAllowed = !(this.addEditWorkout.days[dayIndex].exercises ?? []).includes(relevantSourceEntityId);
        }

        if (isAllowed) {
          e.dataTransfer.dropEffect = 'all';
          dropzone.classList.remove('cursor-not-allowed');
        }
        else {
          e.dataTransfer.dropEffect = 'none';
          dropzone.classList.add('cursor-not-allowed');
        }

        return { relevantSourceEntityId, dropzone, isAllowed };
      },

      workoutDayExercisesDragOverHandler(e) {
        e.preventDefault();
        this.getIsDropAllowed(e);
      },

      workoutDayExercisesDropHandler(e) {
        e.preventDefault();

        const { relevantSourceEntityId, dropzone, isAllowed } = this.getIsDropAllowed(e);

        if (isAllowed) {
          if (this._dragSourceId?.startsWith('exercise-')) {
            const dayIndex = +dropzone.id.split('-').last();
            this.addEditWorkout.days[dayIndex].exercises ??= [];
            this.addEditWorkout.days[dayIndex].exercises.push(relevantSourceEntityId);
            this.saveWorkouts();
          }
          else if (this._dragSourceId?.startsWith('workout-exercise-')) {
            const sourceDayIndex = this.addEditWorkout.days.findIndex(x => (x.exercises ?? []).includes(relevantSourceEntityId));
            const sourceExerciseIndexWithinDay = this.addEditWorkout.days[sourceDayIndex].exercises.indexOf(relevantSourceEntityId);
            this.addEditWorkout.days[sourceDayIndex].exercises.splice(sourceExerciseIndexWithinDay, 1);

            const destinationDayIndex = +dropzone.id.split('-').last();
            this.addEditWorkout.days[destinationDayIndex].exercises ??= [];
            this.addEditWorkout.days[destinationDayIndex].exercises.push(relevantSourceEntityId);
            this.saveWorkouts();
          }
        }
        else {
          console.log('nope');
        }
      },

      saveExercises() {
        window.localStorage.setItem('atg-exercises', JSON.stringify(this.exercises));
      },

      saveWorkouts() {
        window.localStorage.setItem('atg-workouts', JSON.stringify(this.workouts));
      },

      onAddNewExerciseClick() {
        this.addEditExercise = {};
      },

      onAddNewWorkoutClick() {
        this.addEditWorkout = {};
      },

      onEditExercise(id) {
        this.addEditExercise = window.structuredClone(toRaw(this.exercises.filter(x => x.id == id)[0]));
      },

      onSaveExerciseClick() {
        if ((this.addEditExercise.name || '').trim() == '') {
          alert('Enter a name');
          return;
        }

        if (this.exercises.filter(x => x.id != this.addEditExercise.id).map(x => x.name.toLowerCase()).includes(this.addEditExercise.name.trim().toLowerCase())) {
          alert('An exercise with the same name already exists');
          return;
        }

        this.addEditExercise.name = this.addEditExercise.name.trim();

        if (!this.addEditExercise.id) {
          this.addEditExercise.id = this.exercises.length == 0 ? 1 : Math.max(...this.exercises.map(x => x.id)) + 1;
          this.exercises.push(this.addEditExercise);
        }
        else {
          const existing = this.exercises.filter(x => x.id == this.addEditExercise.id)[0];
          Object.assign(existing, this.addEditExercise);
        }

        this.saveExercises();

        this.addEditExercise = null;
      },

      onDeleteExerciseClick(id) {
        if (confirm('Are you sure you want to delete this exercise?')) {
          const idx = this.exercises.findIndex(x => x.id == id);
          this.exercises.splice(idx, 1);
          this.saveExercises();
        }
      },

      onAddNewDayToWorkoutClick() {
        this.addEditWorkout.days ??= [];
        this.addEditWorkout.days.push({});
      },

      onDeleteWorkoutDayClick(index) {
        if (confirm('Are you sure you want to delete this workout day?')) {
          this.addEditWorkout.days.splice(index, 1);
        }
      },

      onDeleteWorkoutExerciseClick(dayIndex, id) {
        const idx = this.addEditWorkout.days[dayIndex].exercises.indexOf(id);
        this.addEditWorkout.days[dayIndex].exercises.splice(idx, 1);
        this.saveWorkouts();
      },

      onSaveWorkoutClick() {
        if ((this.addEditWorkout.name || '').trim() == '') {
          alert('Enter a name');
          return;
        }

        if (this.workouts.filter(x => x.id != this.addEditWorkout.id).map(x => x.name.toLowerCase()).includes(this.addEditWorkout.name.trim().toLowerCase())) {
          alert('A workout with the same name already exists');
          return;
        }

        this.addEditWorkout.name = this.addEditWorkout.name.trim();

        if (!this.addEditWorkout.id) {
          this.addEditWorkout.id = this.workouts.length == 0 ? 1 : Math.max(...this.workouts.map(x => x.id)) + 1;
          this.workouts.push(this.addEditWorkout);
        }
        else {
          const existing = this.workouts.filter(x => x.id == this.addEditWorkout.id)[0];
          Object.assign(existing, this.addEditWorkout);
        }

        this.saveWorkouts();
      },

      onWorkoutSelected(e) {
        this.addEditWorkout = this.workouts.filter(x => x.id == e)[0];
        window.localStorage.setItem('atg-last-workout-id', JSON.stringify(this.addEditWorkout.id));
      },

      onKeyDown(e) {
        let step;

        if (e.keyCode == 38) {
          step = -1;
        }
        else if (e.keyCode == 40) {
          step = 1;
        }

        if (step) {
          if (this.addEditExercise?.id) {
            e.preventDefault();
            this.moveExercise(this.exercises.findIndex(x => x.id == this.addEditExercise.id), step);
          }
        }
      },

      onBackupClick() {
        const exportData = {
          exercises: this.exercises,
          workouts: this.workouts
        };

        fileDownload(JSON.stringify(exportData), `Workout Planner Backup ${getCurrentTimestamp()}.json`);
      },
    }
  }
</script>

<style>
  .cursor-pointer {
    cursor: pointer;
  }

  .cursor-move {
    cursor: move;
  }

  .cursor-not-allowed {
    cursor: not-allowed !important;
  }

  .app .form-select, .app .form-control {
    font-size: inherit;
  }
</style>