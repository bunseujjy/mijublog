<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from "vue";
import { QuillEditor } from "@vueup/vue-quill";
import "@vueup/vue-quill/dist/vue-quill.snow.css";
import Quill from "quill";
// @ts-ignore
import ImageResize from "quill-image-resize";
import { BoldIcon, ItalicIcon, LinkIcon } from "lucide-vue-next";
import type { Session } from "@supabase/supabase-js";
import { useRouter } from "vue-router";
import type { Database } from "~/supabase";
// @ts-ignore
import EditModal from "../ui/editmodal/EditModal.vue";

Quill.register("modules/imageResize", ImageResize);

const props = defineProps<{
  post_id: string | string[]
}>();
const currentUser = ref<{ session: Session } | null>(null);
const router = useRouter();
const route = useRoute()
const editorRef = ref<any>(null);
const title = ref("");
const authorName = ref("Your Name");
const showFloatingToolbar = ref(false);
const isOpen = ref(false);
const client = useSupabaseClient<Database>();
const blog_db = ref<any[]>([]);
const content = ref("");

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
  return editorRef.value?.getQuill();  // Retrieve the Quill instance using getQuill()
};

const handleImageUpload = async (file: File) => {
  try {
    const quill = getQuillInstance();
    if (!quill) return;
    
    const { data, error } = await client.storage
      .from('images')
      .upload(`blog_images/${file.name}`, file);

    if (error) {
      console.error('Error uploading image:', error.message);
      return;
    }

    const imageUrl = client.storage
      .from('images')
      .getPublicUrl(`blog_images/${file.name}`).data.publicUrl;

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
      .eq("id", props.post_id);

    if (error) throw error;

    blog_db.value = data;
    content.value = data?.[0]?.content || '';
    
    const quill = getQuillInstance();
    if (quill) {
      quill.root.innerHTML = content.value;
    }
  } catch (error) {
    console.error("Failed to fetch blog post:", error);
  }
};

const publishStory = async (titleDB: string, contentDB: string) => {
  try {
    const { data, error } = await client
      .from("blog_posts")
      .update({
        title: title.value || titleDB,
        subtitle: content.value || contentDB,
        content: content.value || contentDB,
        status: "pending",
      })
      .eq("id", props.post_id)
      .select("*");

    if (error) throw error;

    if (data && data.length > 0) {
      isOpen.value = true;
    }
  } catch (error) {
    console.error("Error publishing story:", error);
  }
};

const checkSelection = () => {
  const quill = getQuillInstance();
  if (!quill) return;
  
  const range = quill.getSelection();
  showFloatingToolbar.value = Boolean(range && range.length > 0);
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
    isOpen.value = true; // Open modal if success is true
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
  <div class="min-h-screen py-8">
    <div
      v-for="blog in blog_db"
      :key="blog.id"
      class="max-w-3xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden"
    >
    <div v-show="isOpen">
      <EditModal :isOpen="isOpen" @update:open="isOpen = $event" :blog="blog"/>
    </div>
      <header class="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h1 class="text-xl font-semibold text-gray-800">
          Draft in {{ authorName }}
        </h1>
        <button
          @click="() => publishStory(blog.title, blog.content)"
          class="px-4 py-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition duration-300 ease-in-out"
        >
          Publish
        </button>
      </header>

      <div class="px-6 py-8">
        <input
          v-model="title"
          type="text"
          :placeholder="blog.title"
          class="w-full text-4xl font-bold mb-4 focus:outline-none"
        />

        <QuillEditor
          ref="editorRef"
          :options="editorOptions"
          @image-added="handleImageUpload"
          content-type="html"
          :v-model="content"
          :content="content"
          placeholder="Tell your story..."
        />
      </div>
    </div>

    <transition name="fade">
      <div
        v-if="showFloatingToolbar"
        class="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-white rounded-full shadow-lg px-4 py-2"
      >
        <button
          class="mx-2 text-gray-600 hover:text-gray-900"
          @click="() => formatText('bold')"
        >
          <BoldIcon class="w-5 h-5" />
        </button>
        <button
          class="mx-2 text-gray-600 hover:text-gray-900"
          @click="() => formatText('italic')"
        >
          <ItalicIcon class="w-5 h-5" />
        </button>
        <button
          class="mx-2 text-gray-600 hover:text-gray-900"
          @click="() => formatText('link')"
        >
          <LinkIcon class="w-5 h-5" />
        </button>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.text-editor {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.title-input {
  width: 100%;
  font-size: 2rem;
  border: none;
  outline: none;
  margin-bottom: 1rem;
}

.floating-toolbar {
  position: fixed;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 0.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  gap: 0.5rem;
}

.floating-toolbar button {
  padding: 0.25rem;
  border: none;
  background: none;
  cursor: pointer;
  border-radius: 0.25rem;
}

.floating-toolbar button:hover {
  background: #f3f4f6;
}

.actions {
  margin-top: 2rem;
  display: flex;
  justify-content: flex-end;
}

.publish-btn {
  background: #2563eb;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  border: none;
  cursor: pointer;
}

.publish-btn:hover {
  background: #1d4ed8;
}

:deep(.ql-editor) {
  font-family: "Georgia", serif;
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

:deep(.ql-toolbar.ql-snow) {
  border: none;
  border-bottom: 1px solid #e5e7eb;
  padding: 8px 0;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>