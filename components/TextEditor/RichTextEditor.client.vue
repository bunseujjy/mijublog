<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { QuillEditor } from '@vueup/vue-quill';
import '@vueup/vue-quill/dist/vue-quill.snow.css';
import Quill from 'quill';
// @ts-ignore
import ImageResize from 'quill-image-resize';
import { BoldIcon, ItalicIcon, LinkIcon, ListIcon, ImageIcon } from 'lucide-vue-next';
import type { Database } from '~/supabase';
import { useToast } from '../ui/toast';

Quill.register('modules/imageResize', ImageResize);

const client = useSupabaseClient<Database>();
const {user: currentUser} = useAuth()
const {toast} = useToast();
const editor = ref<InstanceType<typeof QuillEditor> | null>(null);
const content = ref('');
const title = ref('');
const subtitle = ref('');
const tags = ref<string[]>([]);
const newTag = ref('');
const showFloatingToolbar = ref<boolean | null>(false);
const titlePlaceholder = "Enter your title...";
const subtitlePlaceholder = "Enter a subtitle...";
const { savePost, manageTags} = usePostManagement()

const floatingTools = [
  { name: 'Bold', format: 'bold', icon: BoldIcon },
  { name: 'Italic', format: 'italic', icon: ItalicIcon },
  { name: 'Link', format: 'link', icon: LinkIcon },
  { name: 'List', format: 'list', icon: ListIcon },
  { name: 'Image', format: 'image', icon: ImageIcon },
];

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

const updateField = (event: Event, field: 'title' | 'subtitle') => {
  const target = event.target as HTMLElement;
  if (field === 'title') {
    title.value = target.innerText.slice(0, 100);
  } else {
    subtitle.value = target.innerText.slice(0, 200);
  }
};

const updateTitle = (event: Event) => updateField(event, 'title');
const updateSubtitle = (event: Event) => updateField(event, 'subtitle');

const handleFocus = (field: 'title' | 'subtitle') => {
  if (field === 'title' && title.value === titlePlaceholder) {
    title.value = "";
  } else if (field === 'subtitle' && subtitle.value === subtitlePlaceholder) {
    subtitle.value = "";
  }
};

const handleBlur = (field: 'title' | 'subtitle') => {
  if (field === 'title' && !title.value.trim()) {
    title.value = titlePlaceholder;
  } else if (field === 'subtitle' && !subtitle.value.trim()) {
    subtitle.value = subtitlePlaceholder;
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
      } else if (format === 'list') {
        quill.format('list', 'bullet');
      } else if (format === 'image') {
        const input = document.createElement('input');
        input.setAttribute('type', 'file');
        input.setAttribute('accept', 'image/*');
        input.click();
        input.onchange = () => {
          const file = input.files?.[0];
          if (file) handleImageUpload(file);
        };
      } else {
        quill.format(format, !quill.getFormat(range)[format]);
      }
    }
  }
};

const handleImageUpload = async (file: File) => {
  try {
    const { data, error } = await client.storage
      .from('blog_images')
      .upload(`${Date.now()}_${file.name}`, file);

    if (error) throw error;

    const imageUrl = client.storage.from('blog_images').getPublicUrl(data.path).data.publicUrl;
    const quill = editor.value?.getQuill();
    if (quill) {
      const range = quill.getSelection();
      quill.insertEmbed(range?.index || 0, 'image', imageUrl);
    }
  } catch (error) {
    console.error('Error uploading image:', error);
    alert('Failed to upload image. Please try again.');
  }
};

const addTag = () => {
  const tag = newTag.value.trim().toLowerCase();
  if (tag && !tags.value.includes(tag)) {
    tags.value.push(tag);
    newTag.value = '';
  }
};

const removeTag = (tagToRemove: string) => {
  tags.value = tags.value.filter(tag => tag !== tagToRemove);
};

const saveDraft = async () => {
  try {
    const { data, error } = await client
      .from("blog_posts")
      .insert({
        slug: title.value.toLowerCase().replace(/\s+/g, '-').slice(0, 100),
        title: title.value,
        subtitle: subtitle.value,
        content: content.value,
        tags: tags.value,
        status: "draft",
        author_id: currentUser?.value?.id
      })
      .select("*");

    if (error) throw error;

    if(data) {
      toast({
        description: "Draft saved successfully"
      });
      title.value = '';
      subtitle.value = '';
      tags.value = [];
      content.value = '';
    }
  } catch (error) {
    console.error("Error saving draft:", error);
  }
};

const publishStory = async () => {
  const quillEditor = editor.value?.getQuill();
  const contentHtml = quillEditor ? quillEditor.root.innerHTML : '';
  content.value = contentHtml;

  if (!title.value || !contentHtml) {
    toast({
      description: "Please provide both a title and content for your story.",
      variant: 'destructive',
    });
    return;
  }

  try {
    await savePost(title.value, subtitle.value, contentHtml, tags.value, currentUser.value);
    await manageTags(tags.value);
  } catch (error) {
    console.error('Error publishing post:', error);
    toast({
      description: "Failed to publish your story. Please try again.",
      variant: 'destructive'
    });
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
});

onUnmounted(() => {
  const quill = editor.value?.getQuill();
  if (quill) {
    quill.off('selection-change', checkSelection);
  }
});
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
    <div class="max-w-4xl mx-auto bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-xl rounded-lg overflow-hidden">
      <header class="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <h1 class="text-xl font-semibold text-gray-700 dark:text-gray-300">Create Your Story</h1>
        <div class="space-x-2">
          <button @click="saveDraft" class="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition duration-300 ease-in-out">
            Save Draft
          </button>
          <button @click="publishStory" class="px-4 py-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition duration-300 ease-in-out">
            Publish
          </button>
        </div>
      </header>
      
      <div class="px-6 py-8">
        <div class="mb-6">
          <label for="title" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Title <span class="text-xs">(100 Characters only)</span></label>
          <div
            id="title"
            v-text="title"
            contenteditable="true"
            :placeholder="titlePlaceholder"
            :class="['w-full text-4xl font-bold mb-2 focus:outline-none break-words whitespace-pre-wrap bg-transparent', {'placeholder': !title.trim()}]"
            @input="updateTitle"
            @focus="handleFocus('title')"
            @blur="handleBlur('title')"
          ></div>
        </div>

        <div class="mb-6">
          <label for="subtitle" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Subtitle <span class="text-xs">(200 Characters only)</span></label>
          <div
            id="subtitle"
            v-text="subtitle"
            contenteditable="true"
            :placeholder="subtitlePlaceholder"
            :class="['w-full text-xl mb-2 focus:outline-none break-words whitespace-pre-wrap bg-transparent', {'placeholder': !subtitle.trim()}]"
            @input="updateSubtitle"
            @focus="handleFocus('subtitle')"
            @blur="handleBlur('subtitle')"
          ></div>
        </div>

        <div class="mb-6">
          <label for="tags" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tags</label>
          <div class="flex flex-wrap gap-2">
            <span v-for="tag in tags" :key="tag" class="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-full text-sm">
              {{ tag }}
              <button @click="removeTag(tag)" class="ml-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">&times;</button>
            </span>
            <input
              v-model="newTag"
              @keydown.enter.prevent="addTag"
              placeholder="Add a tag..."
              class="bg-transparent border-b border-gray-300 dark:border-gray-600 focus:outline-none focus:border-green-500 dark:focus:border-green-400 px-2 py-1 text-sm"
            />
          </div>
        </div>

        <div class="relative">
          <QuillEditor
            ref="editor"
            :options="editorOptions"
            @image-added="handleImageUpload"
            content-type="html"
            v-model="content"
            placeholder="Tell your story..."
            class="prose dark:prose-invert max-w-none"
          />
          
          <transition name="fade">
            <div v-if="showFloatingToolbar" class="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white dark:bg-gray-700 rounded-full shadow-lg px-4 py-2 flex items-center space-x-2">
              <button v-for="tool in floatingTools" :key="tool.name" @click="formatText(tool.format)" :title="tool.name" class="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100">
                <component :is="tool.icon" class="w-5 h-5" />
              </button>
            </div>
          </transition>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
:deep(.ql-editor) {
  font-family: 'Georgia', serif;
  font-size: 18px;
  line-height: 1.6;
  padding: 0;
  padding-top: 5px;
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
  left: 0px;
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