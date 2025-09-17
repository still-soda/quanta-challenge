<script setup lang="ts">
import type { WebContainer, WebContainerProcess } from '@webcontainer/api';
import type { IProgressStep } from '~/components/st/Progress/type';
import { useTerminal } from '~/composables/challenge/use-terminal';
import { useEventEmitter } from '~/composables/utils/use-event-emitter';
import { acceptedBinaryExtensions } from '~/configs/accepted-pack-extension';

const props = defineProps<{
   getWcInstance: () => Promise<WebContainer>;
   runCommands: (command: string) => Promise<WebContainerProcess>;
   problemId: number;
}>();

const opened = defineModel<boolean>('opened');

const steps = ref<IProgressStep[]>([]);
const initSteps = () => {
   steps.value = [
      { title: '构建', status: 'inProgress' },
      { title: '快照', status: 'waiting' },
      { title: '上传', status: 'waiting' },
   ];
};

const editorStore = useEditorStore();
const { containerKey, attachProcess, onTerminalReady } = useTerminal();
const { event } = useEventEmitter('challenge-layout', 'commit');
const isCommitting = ref(false);
const currentStep = ref(0);
watch(event, async () => {
   if (!editorStore.hasProjectInitialized) return;
   opened.value = true;

   if (isCommitting.value) return;
   isCommitting.value = true;

   initSteps();
   onTerminalReady(async (terminal, fitAddon) => {
      terminal.clear();
      nextTick(() => fitAddon.fit());
      try {
         await runBuildStep();
         const pack = await runPackStep();
         const recordId = await runUploadStep(pack);
         close(recordId);
      } catch (e) {
         console.error(e);
         steps.value.find((step) => step.status === 'inProgress')!.status =
            'error';
      } finally {
         isCommitting.value = false;
      }
   });
});

let runningProcess: WebContainerProcess | null = null;
const runBuildStep = async () => {
   runningProcess = await props.runCommands('yarn --cwd ./project build');
   await attachProcess(runningProcess);

   const code = await runningProcess.exit;
   runningProcess = null;
   if (code !== 0) {
      throw new Error('Failed to build');
   }

   steps.value[0]!.status = 'completed';
   steps.value[1]!.status = 'inProgress';
};

const runPackStep = async () => {
   const instance = await props.getWcInstance();
   // pack 'dist' dir
   const traverse = async (
      dirPath: string = '/project/dist',
      pathContentMap: Record<string, string> = {}
   ) => {
      const files = await instance.fs.readdir(dirPath, {
         withFileTypes: true,
      });
      for (const file of files) {
         const path = `${dirPath}/${file.name}`;

         if (file.isDirectory()) {
            await traverse(path, pathContentMap);
            continue;
         }

         const extension = file.name.split('.').pop()!;
         const encoding = acceptedBinaryExtensions.includes(extension)
            ? 'base64'
            : 'utf-8';
         pathContentMap[path.slice('/project/dist'.length)] =
            await instance.fs.readFile(path, encoding);
      }

      return pathContentMap;
   };

   const pack = await traverse();
   steps.value[1]!.status = 'completed';
   steps.value[2]!.status = 'inProgress';

   return pack;
};

const { $trpc } = useNuxtApp();
const runUploadStep = async (pack: Record<string, string>) => {
   const { judgeRecordId } = await atLeastTime(
      500,
      $trpc.protected.problem.commitAnswer.mutate({
         problemId: props.problemId,
         snapshot: pack,
      })
   );
   steps.value[2]!.status = 'completed';

   return judgeRecordId;
};

const close = (recordId: number) => {
   runningProcess?.kill();
   opened.value = false;
   navigateTo(`/challenge/record/${recordId}`);
};

const closable = computed(() => {
   return (
      currentStep.value === 0 || steps.value.some((s) => s.status === 'error')
   );
});
</script>

<template>
   <StModal v-model:opened="opened">
      <StModalWindow
         @close="close"
         title="正在准备提交"
         :closable="closable"
         class="border border-secondary w-[31.25rem]">
         <StSpace fill-x gap="1.25rem" direction="vertical" align="center">
            <StProgress
               direction="horizontal"
               :steps="steps"
               class="!w-[21.25rem]" />
            <main
               class="w-[28.75rem] h-[10.9375rem] rounded-[0.375rem] bg-[#1C1C1C] relative overflow-auto">
               <StSpace fill class="relative my-2 mx-3">
                  <main
                     :ref="containerKey"
                     class="absolute left-0 top-0 h-full"></main>
               </StSpace>
            </main>
         </StSpace>
      </StModalWindow>
   </StModal>
</template>
