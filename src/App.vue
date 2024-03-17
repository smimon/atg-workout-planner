<template>
  <div class="app" style="font-size: 85%;">
    <div v-if="isInitialising" class="d-flex vh-100 align-items-center justify-content-center">
      <BSpinner />
    </div>

    <div v-else class="d-flex">
      <div class="flex-grow-1 p-3 d-flex">

        <!-- Exercises List -->
        <div>
          <div class="border rounded p-2 bg-very-light-gray" style="max-height: 95vh; overflow: auto;">
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
                        :is-assigned="getIsExerciseAssigned(exercise.id)"
                        @drag-start="dragStartHandler"
                        @drag-end="dragEndHandler"
                        @select="onEditExercise(exercise.id)"
                        @move="moveExercise(index, $event)"
                        @delete="onDeleteExerciseClick(exercise.id)">
              </Exercise>
            </template>
            <div class="mt-3">
              <button class="btn btn-primary" @click="onAddNewExerciseClick">Add New</button>
            </div>
          </div>

          <div class="mt-3 d-flex">
            <button class="btn btn-secondary" @click="onImportDataClick">Import</button>
            <button class="btn btn-secondary ms-auto" @click="onBackupDataClick">Backup</button>
            <input v-show="false" ref="backupFileInput" type="file" accept=".json" @input="onBackupFileInput" />
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
              <div class="flex-fill w-50">
                <label>Select a workout</label>
                <BFormSelect :options="workoutsOptions" v-model="selectedWorkoutId" @input="onWorkoutSelected" />
              </div>
              <div v-if="addEditWorkout" class="flex-fill ms-3 w-50">
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
                <div v-for="(workoutDay, dayIndex) in addEditWorkout.days"
                     :key="dayIndex"
                     class="border rounded m-1 p-1 bg-very-light-gray">
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
                              @drag-start="dragStartHandler"
                              @drag-end="dragEndHandler"
                              @move="moveWorkoutDayExercise(dayIndex, exerciseIndex, $event)"
                              @select="onWorkoutExerciseSelected(exercisesMap[exerciseId])"
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
              <button class="btn btn-primary btn-sm" @click="onAddNewDayToWorkoutClick">Add New Day to Workout</button>
            </div>

            <div class="mt-5 d-flex">
              <button class="btn btn-primary" @click="onSaveWorkoutClick">Save</button>
              <button class="btn btn-warning ms-2" @click="addEditWorkout = null">Cancel</button>
              <button class="btn btn-info ms-2" @click="onCopyWorkoutToNewClick">Copy to New</button>
              <button class="btn btn-danger ms-2" @click="onDeleteWorkoutClick">Delete</button>
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
          <BFormTextarea v-model="addEditExercise.notes"
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

    <BModal v-model="showEditExerciseNodesModal" hide-header hide-footer scrollable>
      <div v-if="exerciseForEditNotes">
        <BFormTextarea ref="editWorkoutExerciseNotes"
                       v-model="exerciseForEditNotes.notes"
                       placeholder="Notes"
                       rows="6"
                       style="height: 80vh" />

        <div class="mt-2 d-flex">
          <button class="btn btn-primary btn-sm" @click="onStampDateForEditExerciseNotesForWorkoutExerciseClick">Stamp Today's Date</button>
          <button class="btn btn-secondary btn-sm ms-auto" @click="exerciseForEditNotes = null">Cancel</button>
          <button class="btn btn-primary btn-sm ms-2" @click="onSaveEditExerciseNotesForWorkoutExerciseClick">Save</button>
        </div>
      </div>
    </BModal>

  </div>
</template>

<script>
  import { toRaw } from 'vue';
  import fileDownload from 'js-file-download';
  import { Redis } from '@upstash/redis';

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
        isInitialising: true,
        exercises: [],
        addEditExercise: null,
        workouts: [],
        addEditWorkout: null,
        selectedWorkoutId: null,
        exerciseForEditNotes: null,
        enumToOptions,
        BodyPart,
        ExerciseType,
        ExerciseIntensity
      };
    },

    computed: {
      exercisesMap() {
        return this.exercises.toDictionary(x => x.id, x => x);
      },

      workoutsOptions() {
        return this.workouts.map(x => ({ value: x.id, text: x.name }));
      },

      showEditExerciseNodesModal: {
        get() {
          return this.exerciseForEditNotes != null;
        },
        set(value) {
          if (!value) {
            this.exerciseForEditNotes = null;
          }
        }
      }
    },

    async created() {
      this._redis = new Redis({
        url: 'https://eager-antelope-39385.upstash.io',
        token: 'AZnZASQgYTJjY2ZkOWEtNWJlNS00ZTYyLTllYmQtYmFkNDc1NjE5YTEyM2Q4ZDc2Y2M0ZDg4NDk1OGIwZjE3OWU4NWJlYmI5ZDY=',
      });

      const exercises = await this._redis.get('atg-exercises');

      if (exercises) {
        this.exercises = exercises;
      }

      const workouts = await this._redis.get('atg-workouts');

      if (workouts) {
        this.workouts = workouts;
      }

      const lastWorkoutId = window.localStorage.getItem('atg-last-workout-id');

      if (lastWorkoutId && this.workouts.findIndex(x => x.id == +lastWorkoutId) != -1) {
        this.selectedWorkoutId = +lastWorkoutId;
        this.onWorkoutSelected(+lastWorkoutId);
      }

      document.addEventListener('keydown', this.onKeyDown);

      this.isInitialising = false;
    },

    onBeforeDestroy() {
      document.removeEventListener('keydown', this.onKeyDown);
    },

    methods: {
      async moveExercise(currentIndex, step) {
        const [element] = this.exercises.splice(currentIndex, 1);
        this.exercises.splice(currentIndex + step, 0, element);
        await this.saveExercises();
      },

      async moveWorkoutDayExercise(dayIndex, currentIndex, step) {
        const [element] = this.addEditWorkout.days[dayIndex].exercises.splice(currentIndex, 1);
        this.addEditWorkout.days[dayIndex].exercises.splice(currentIndex + step, 0, element);
        await this.saveWorkouts();
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

      async workoutDayExercisesDropHandler(e) {
        e.preventDefault();

        const { relevantSourceEntityId, dropzone, isAllowed } = this.getIsDropAllowed(e);

        if (isAllowed) {
          if (this._dragSourceId?.startsWith('exercise-')) {
            const dayIndex = +dropzone.id.split('-').last();
            this.addEditWorkout.days[dayIndex].exercises ??= [];
            this.addEditWorkout.days[dayIndex].exercises.push(relevantSourceEntityId);
            await this.saveWorkouts();
          }
          else if (this._dragSourceId?.startsWith('workout-exercise-')) {
            const sourceDayIndex = this.addEditWorkout.days.findIndex(x => (x.exercises ?? []).includes(relevantSourceEntityId));
            const sourceExerciseIndexWithinDay = this.addEditWorkout.days[sourceDayIndex].exercises.indexOf(relevantSourceEntityId);
            this.addEditWorkout.days[sourceDayIndex].exercises.splice(sourceExerciseIndexWithinDay, 1);

            const destinationDayIndex = +dropzone.id.split('-').last();
            this.addEditWorkout.days[destinationDayIndex].exercises ??= [];
            this.addEditWorkout.days[destinationDayIndex].exercises.push(relevantSourceEntityId);
            await this.saveWorkouts();
          }
        }
        else {
          console.log('nope');
        }
      },

      getIsExerciseAssigned(exerciseId) {
        return this.addEditWorkout.days.some(x => (x.exercises?.indexOf(exerciseId) ?? -1) != -1);
      },

      async saveExercises() {
        window.localStorage.setItem('atg-exercises', JSON.stringify(this.exercises));
        await this._redis.set('atg-exercises', JSON.stringify(this.exercises));
      },

      async saveWorkouts() {
        window.localStorage.setItem('atg-workouts', JSON.stringify(this.workouts));
        await this._redis.set('atg-workouts', JSON.stringify(this.workouts));
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

      async onSaveExerciseClick() {
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

        await this.saveExercises();

        this.addEditExercise = null;
      },

      async onDeleteExerciseClick(id) {
        if (confirm('Are you sure you want to delete this exercise?')) {
          const idx = this.exercises.findIndex(x => x.id == id);
          this.exercises.splice(idx, 1);
          await this.saveExercises();
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

      async onDeleteWorkoutExerciseClick(dayIndex, id) {
        const idx = this.addEditWorkout.days[dayIndex].exercises.indexOf(id);
        this.addEditWorkout.days[dayIndex].exercises.splice(idx, 1);
        await this.saveWorkouts();
      },

      async onSaveWorkoutClick() {
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

        await this.saveWorkouts();
      },

      onWorkoutSelected(e) {
        this.addEditWorkout = this.workouts.filter(x => x.id == e)[0];
        window.localStorage.setItem('atg-last-workout-id', JSON.stringify(this.addEditWorkout.id));
      },

      async onKeyDown(e) {
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
            await this.moveExercise(this.exercises.findIndex(x => x.id == this.addEditExercise.id), step);
          }
        }
      },

      onImportDataClick() {
        this.$refs.backupFileInput.click();
      },

      async onBackupFileInput(e) {
        const backup = await new Promise((resolve, reject) => {
          const reader = new FileReader();

          reader.onload = (event) => {
            try {
              const result = JSON.parse(event.target.result);
              resolve(result);
            }
            catch (error) {
              reject(error);
            }
          };

          reader.onerror = (error) => {
            reject(error);
          };

          reader.readAsText(e.target.files[0]);
        });

        this.exercises = backup.exercises;
        this.workouts = backup.workouts;

        await this.saveExercises();
        await this.saveWorkouts();
      },

      onBackupDataClick() {
        const exportData = {
          exercises: this.exercises,
          workouts: this.workouts
        };

        fileDownload(JSON.stringify(exportData), `Workout Planner Backup ${getCurrentTimestamp()}.json`);
      },

      async onCopyWorkoutToNewClick() {
        const newName = prompt('Enter new name');

        if (this.workouts.map(x => x.name.toLowerCase()).includes(newName.trim().toLowerCase())) {
          alert('A workout with the same name already exists');
          return;
        }

        const clone = structuredClone(toRaw(this.addEditWorkout));
        clone.name = newName;
        clone.id = this.workouts.length == 0 ? 1 : Math.max(...this.workouts.map(x => x.id)) + 1;

        this.workouts.push(clone);

        this.selectedWorkoutId = clone.id;
        this.onWorkoutSelected(clone.id);

        await this.saveWorkouts();
      },

      async onDeleteWorkoutClick() {
        if (confirm('Are you sure you want to delete this workout?')) {
          const idx = this.workouts.findIndex(x => x.id == this.addEditWorkout.id);
          this.workouts.splice(idx, 1);
          this.addEditWorkout = null;
          await this.saveWorkouts();
        }
      },

      onWorkoutExerciseSelected(exercise) {
        this.exerciseForEditNotes = structuredClone(toRaw(exercise));
      },

      async onSaveEditExerciseNotesForWorkoutExerciseClick() {
        const exercise = this.exercises.filter(x => x.id == this.exerciseForEditNotes.id)[0];
        exercise.notes = this.exerciseForEditNotes.notes;

        await this.saveExercises();

        this.exerciseForEditNotes = null;
      },

      onStampDateForEditExerciseNotesForWorkoutExerciseClick() {
        let dateStamp = new Date().toLocaleDateString(
          'en-GB',
          {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
          })
          .replace(/ /g, ' ');

        this.exerciseForEditNotes.notes ??= '';

        if (this.exerciseForEditNotes.notes.trim() != '') {
          dateStamp = '\r\n------------------------------\r\n' + dateStamp;
        }

        this.exerciseForEditNotes.notes += dateStamp + '\r\n\r\n';

        this.$refs.editWorkoutExerciseNotes.focus();
      }
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

  .bg-very-light-gray {
    background-color: #f8f8f8;
  }
</style>