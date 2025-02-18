
<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, nextTick, watchEffect } from "vue";
import { QuillEditor } from "@vueup/vue-quill";
import "@vueup/vue-quill/dist/vue-quill.snow.css";
import Quill from "quill";
// @ts-ignore
import ImageResize from "quill-image-resize";
import { BoldIcon, ItalicIcon, LinkIcon, ListIcon, ImageIcon } from "lucide-vue-next";
import {  useRoute } from "vue-router";
import type { Database } from "~/supabase";
import { useToast } from "../ui/toast";
import type { BlogData } from "~/lib/type";
Quill.register("modules/imageResize", ImageResize);

const props = defineProps<{
  post_id: string | string[]
}>();

const {user: currentUser} = useAuth()
const {toast} = useToast()
const route = useRoute();
const editorRef = ref<any>(null);
const title = ref("");
const subtitle = ref("");
const showFloatingToolbar = ref(false);
const isOpen = ref(false);
const client = useSupabaseClient<Database>();
const blog_db = ref<BlogData[]>([]);
const content = ref("");
const tags = ref<string[]>([]);
const newTag = ref("");

const floatingTools = [
  { name: 'Bold', format: 'bold', icon: BoldIcon },
  { name: 'Italic', format: 'italic', icon: ItalicIcon },
  { name: 'Link', format: 'link', icon: LinkIcon },
  { name: 'List', format: 'list', icon: ListIcon },
  { name: 'Image', format: 'image', icon: ImageIcon },
];

const editorOptions = {
  theme: "snow",
  modules: {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ align: [] }],
      ["link", "image"],
      ["clean"],
    ],
    imageResize: {
      displaySize: true,
      modules: ["Resize", "DisplaySize", "Toolbar"],
    },
  },
};

const getQuillInstance = () => {
  return editorRef.value?.getQuill();
};

const handleImageUpload = async (file: File) => {
  try {
    const quill = getQuillInstance();
    if (!quill) return;
    
    const { data, error } = await client.storage
      .from('images')
      .upload(`blog_images/${Date.now()}_${file.name}`, file);

    if (error) {
      console.error('Error uploading image:', error.message);
      return;
    }

    const imageUrl = client.storage
      .from('images')
      .getPublicUrl(`blog_images/${data.path}`).data.publicUrl;

    const range = quill.getSelection();
    quill.insertEmbed(range?.index || 0, 'image', imageUrl);
  } catch (error) {
    console.error('Error handling image upload:', error);
  }
};

const formatText = (format: string) => {
  const quill = getQuillInstance();
  if (!quill) return;
  
  const range = quill.getSelection();
  
  if (range) {
    if (format === "link") {
      const url = prompt("Enter the URL:");
      if (url) {
        quill.format("link", url);
      }
    } else if (format === "list") {
      quill.format("list", "bullet");
    } else if (format === "image") {
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
};

const getBlogPost = async () => {
  try {
    const { data, error } = await client
      .from("blog_posts")
      .select("*")
      .eq("id", props.post_id as string);

    if (error) throw error;

    blog_db.value = data as any;
    content.value = data?.[0]?.content || '';
    title.value = data?.[0]?.title || '';
    subtitle.value = data?.[0]?.subtitle || '';
    tags.value = data?.[0]?.tags || [];
    const quill = getQuillInstance();
    if (quill) {
      quill.root.innerHTML = content.value;
    }
  } catch (error) {
    console.error("Failed to fetch blog post:", error);
  }
};

const saveDraft = async () => {
  try {
    const { data, error } = await client
      .from("blog_posts")
      .update({
        title: title.value,
        subtitle: subtitle.value,
        content: content.value,
        tags: tags.value,
        status: "draft",
      })
      .eq("id", props.post_id as string)
      .select("*");

    if (error) throw error;

    if(data) {
      toast({
        description: "Draft saved successfully"
      })
    }
  } catch (error) {
    console.error("Error saving draft:", error);
  }
};

const publishStory = async (titleDB: string, contentDB: string) => {
  try {
    const { data, error } = await client
      .from("blog_posts")
      .update({
        title: title.value || titleDB,
        subtitle: subtitle.value,
        content: content.value || contentDB,
        tags: tags.value,
        status: "posted",
      })
      .eq("id", props.post_id as string)
      .select("*");

    if (error) throw error;

    if (data && data.length > 0) {
      isOpen.value = true;
    }
  } catch (error) {
    console.error("Error publishing story:", error);
  }
};

const addTag = () => {
  const tag = newTag.value.trim();
  if (tag && !tags.value.includes(tag)) {
    tags.value.push(tag);
    newTag.value = '';
  }
};

const removeTag = (tagToRemove: string) => {
  tags.value = tags.value.filter(tag => tag !== tagToRemove);
};

const checkSelection = () => {
  const quill = getQuillInstance();
  if (!quill) return;
  
  const range = quill.getSelection();
  showFloatingToolbar.value = Boolean(range && range.length > 0);
};

const updateTitle = (event: Event) => {
  title.value = (event.target as HTMLDivElement).innerText;
};

const updateSubtitle = (event: Event) => {
  subtitle.value = (event.target as HTMLDivElement).innerText;
};

onMounted(async () => {
  try {
    await getBlogPost();
    nextTick(() => {
      const quill = editorRef.value?.getEditor?.() || editorRef.value?.getEditorInstance?.();
      if (quill) {
        quill.on("selection-change", checkSelection);
      } else {
        console.warn("Quill instance not found after nextTick.");
      }
    });
  } catch (error) {
    console.error("Error during component mount:", error);
  }
});

watchEffect(() => {
  if (route.query.success === 'true') {
    isOpen.value = true;
  }
});

onUnmounted(() => {
  const quill = getQuillInstance();
  if (quill) {
    quill.off("selection-change", checkSelection);
  }
});
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
    <div
      v-for="blog in blog_db"
      :key="blog.id"
      class="max-w-4xl mx-auto bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-xl rounded-lg overflow-hidden"
    >
      <div v-show="isOpen">
        <EditBlogModal :isOpen="isOpen" @update:open="isOpen = $event" :blog="blog" :title="title" :subtitle="subtitle" :tags="tags"/>
      </div>
      <header class="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <h1 class="text-xl font-semibold text-gray-800 dark:text-gray-200">
          Draft by {{ currentUser?.user_metadata?.username }}
        </h1>
        <div class="space-x-2">
          <button
            @click="saveDraft"
            class="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition duration-300 ease-in-out"
          >
            Save Draft
          </button>
          <button
            @click="() => publishStory(blog.title, blog.content ?? '')"
            class="px-4 py-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition duration-300 ease-in-out"
          >
            Publish
          </button>
        </div>
      </header>

      <div class="px-6 py-8">
        <label for="title" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Title <span class="text-xs">(100 Characters only)</span></label>
        <div
          v-text="title"
          contenteditable="true"
          :placeholder="blog.title"
          @input="updateTitle"
          class="w-full text-4xl font-bold mb-4 focus:outline-none bg-transparent break-words whitespace-pre-wrap"
        ></div>

        <div class="mb-4">
          <label for="subtitle" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Subtitle <span class="text-xs">(200 Characters only)</span></label>
          <div
            v-text="subtitle"
            contenteditable="true"
            placeholder="Enter a subtitle..."
            @input="updateSubtitle"
            class="w-full text-xl mb-4 focus:outline-none bg-transparent border-b border-gray-300 dark:border-gray-600 break-words whitespace-pre-wrap"
          ></div>
        </div>

        <div class="mb-4">
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

        <QuillEditor
          ref="editorRef"
          :options="editorOptions"
          @image-added="handleImageUpload"
          content-type="html"
          v-model="content"
          :content="content"
          placeholder="Tell your story..."
          class="prose dark:prose-invert max-w-none"
        />
      </div>
    </div>

    <transition name="fade">
      <div
        v-if="showFloatingToolbar"
        class="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-white dark:bg-gray-800 rounded-full shadow-lg px-4 py-2 flex items-center space-x-2"
      >
        <button
          v-for="tool in floatingTools"
          :key="tool.name"
          @click="() => formatText(tool.format)"
          :title="tool.name"
          class="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
        >
          <component :is="tool.icon" class="w-5 h-5" />
        </button>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.prose {
  max-width: none;
}

:deep(.ql-editor) {
  font-family: "Georgia", serif;
  font-size: 18px;
  line-height: 1.8;
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
  color: #a1a1a1;
}

:deep(.ql-snow .ql-editor img) {
  max-width: 100%;
  margin: 1em 0;
  border-radius: 4px;
}

:deep(.ql-toolbar.ql-snow) {
  border: none;
  border-bottom: 1px solid #e5e7eb;
  padding: 8px 0;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s, transform 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>

