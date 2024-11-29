<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { QuillEditor } from '@vueup/vue-quill';
import '@vueup/vue-quill/dist/vue-quill.snow.css';
import Quill from 'quill';
// @ts-ignore
import ImageResize from 'quill-image-resize';
import { BoldIcon, ItalicIcon, LinkIcon } from 'lucide-vue-next';
import type { Session, User } from '@supabase/supabase-js';
import type { Database } from '~/supabase';
Quill.register('modules/imageResize', ImageResize);

const client = useSupabaseClient<Database>();
const currentUser = ref<any>();
const router = useRouter();
const editor = ref<InstanceType<typeof QuillEditor> | null>(null);
const content = ref('');
const title = ref('');
const subtitle = ref('');
const showFloatingToolbar = ref<boolean | null>(false);
const titlePlaceholder = "Title";
const subtitlePlaceholder = "Subtitle...";

const editorOptions = {
  theme: 'snow',
  modules: {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'align': [] }],
      ['link', 'image'],
      ['clean']
    ],
    imageResize: {
      displaySize: true,
      modules: ['Resize', 'DisplaySize', 'Toolbar']
    }
  },
  placeholder: 'Tell your story...'
};

// Update the title based on input
const updateTitle = (event: Event) => {
  const target = event.target as HTMLElement;
  title.value = target.innerText; // Update title with the editable content
};

const updateSubtitle = (event: Event) => {
  const target = event.target as HTMLElement;
  subtitle.value = target.innerText; // Update title with the editable content
};

const handleFocus = () => {
  if (title.value) {
    if (title.value === titlePlaceholder) {
      title.value = "";
    }
  } else {
    if (subtitle.value === subtitlePlaceholder) {
      subtitle.value = "";
    }
  }
};

const handleBlur = () => {
  if (title.value) {
    if (!title.value.trim()) {
      title.value = titlePlaceholder;
    }
  } else {
    if (subtitle.value.trim()) {
      subtitle.value = subtitlePlaceholder;
    }
  }
};

const formatText = (format: string) => {
  const quill = editor.value?.getQuill();
  if (quill) {
    const range = quill.getSelection();
    if (range) {
      if (format === 'link') {
        const url = prompt('Enter the URL:');
        if (url) {
          quill.format('link', url);
        }
      } else {
        quill.format(format, !quill.getFormat(range)[format]);
      }
    }
  }
};
// Handle image upload
const handleImageUpload = async (file: File) => {
  const reader = new FileReader();
  reader.onload = async (e) => {
    const quill = editor.value?.getQuill();
    if (quill && e.target?.result) {
      const { error } = await client.storage
        .from('images') // your storage bucket
        .upload(`blog_images/${file.name}`, file);

      if (error) {
        console.error('Error uploading image:', error.message);
        return;
      }

      const imageUrl = client.storage.from('images').getPublicUrl(`blog_images/${file.name}`).data.publicUrl;
      const range = quill.getSelection();
      quill.insertEmbed(range?.index || 0, 'image', imageUrl);
    }
  };
  reader.readAsDataURL(file);
};

// Publish story
const publishStory = async () => {
  const quillEditor = editor.value?.getQuill();
  const contentHtml = quillEditor ? quillEditor.root.innerHTML : '';
  content.value = contentHtml;

  if (!title.value || !content.value) {
    console.error("Title or content is missing");
    return;
  }

  const { data, error } = await client
    .from('blog_posts')
    .insert([{
      slug: title.value,
      title: title.value,
      content: contentHtml,
      subtitle: subtitle.value,
      author_id: currentUser.value?.id,
      status: 'pending',
    }])
    .select('*');

  if (error) {
    console.error('Error inserting post:', error.message);
    return;
  }

  if (data && data.length > 0) {
    const postId = data[0].id;
    const username = currentUser.value?.user_metadata.username;
    router.push(`/post/@${encodeURIComponent(username)}/${postId}/edit?success=true`);
  }
};

const checkSelection = () => {
  const quill = editor.value?.getQuill();
  if (quill) {
    const range = quill.getSelection();
    showFloatingToolbar.value = range && range.length > 0;
  }
};

onMounted(async () => {
  const quill = editor.value?.getQuill();
  if (quill) {
    quill.on('selection-change', checkSelection);
  }
  await getCurrentUser(currentUser);
});

onUnmounted(() => {
  const quill = editor.value?.getQuill();
  if (quill) {
    quill.off('selection-change', checkSelection);
  }
});
</script>

<template>
  <div class="min-h-screen  py-8">
    <div class="max-w-3xl mx-auto text-black dark:text-white shadow-lg rounded-lg overflow-hidden">
      <header class="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h1 class="text-xl font-semibold text-black md:text-muted">Draft in</h1>
        <button @click="publishStory" class="px-4 py-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition duration-300 ease-in-out">
          Publish
        </button>
      </header>
      
      <div class="px-6 py-8">
      <!-- Title input as a contenteditable div -->
      <p>{{ 100 - title.length }} characters remaining</p>
      <div
      id="title"
        v-text="title"
        contenteditable="true"
        placeholder="Title"
        :class="['w-full text-4xl font-bold mb-4 focus:outline-none break-words whitespace-pre-wrap', {'titlePlaceholder' : !title.trim()}]"
        maxlength="100"
        role="textbox"
        @focus="handleFocus" @blur="handleBlur"
        @input="updateTitle($event)"
      ></div>

      <!-- Subtitle input as a contenteditable div -->
      <p>{{ 140 - subtitle.length }} characters remaining</p>
      <div
      id="subtitle"
        v-text="subtitle"
        contenteditable="true"
        placeholder="Subtitle"
        :class="['w-full text-lg font-bold mb-4 focus:outline-none break-words whitespace-pre-wrap', {'subtitlePlaceholder' : !subtitle.trim()}]"
        maxlength="140"
        role="textbox"
        @focus="handleFocus" @blur="handleBlur"
        @input="updateSubtitle($event)"
      ></div>

      <!-- Quill Editor -->
       <div class="pt-5">
        
      <QuillEditor
        ref="editor"
        :options="editorOptions"
        @image-added="handleImageUpload"
        content-type="html"
        v-model="content"
        placeholder="Tell your story..."
        style="padding-top: 20px;"
        />
       </div>
  </div>
    </div>

    <transition name="fade">
      <div v-if="showFloatingToolbar" class="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-white rounded-full shadow-lg px-4 py-2">
        <button class="mx-2 text-gray-600 hover:text-gray-900" @click="formatText('bold')">
          <BoldIcon class="w-5 h-5" />
        </button>
        <button class="mx-2 text-gray-600 hover:text-gray-900" @click="formatText('italic')">
          <ItalicIcon class="w-5 h-5" />
        </button>
        <button class="mx-2 text-gray-600 hover:text-gray-900" @click="formatText('link')">
          <LinkIcon class="w-5 h-5" />
        </button>
      </div>
    </transition>
  </div>
</template>

<style scoped>
:deep(.ql-editor) {
  font-family: 'Georgia', serif;
  font-size: 18px;
  line-height: 1.6;
  padding: 0;
  min-height: 300px;
}

:deep(.ql-editor p) {
  margin-bottom: 1.5em;
}

:deep(.ql-container.ql-snow) {
  border: none;
}

:deep(.ql-editor.ql-blank::before) {
  font-style: normal;
  font-size: 18px;
  color: #999;
}

:deep(.ql-snow .ql-editor img) {
  max-width: 100%;
  margin: 1em 0;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

:deep(.ql-toolbar.ql-snow) {
  border: none;
  border-bottom: 1px solid #e5e7eb;
  padding: 8px 0;
}

/* Optional: Style to make it look more like a real placeholder */
#title:empty:before {
  content: attr(placeholder);
  color: #a1a1a1;
}

#subtitle:empty:before {
  content: attr(placeholder);
  color: #a1a1a1;
}
</style>