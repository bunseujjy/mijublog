<script setup lang="ts">
import { ref } from 'vue'
import { X, ImageIcon, Loader2 } from 'lucide-vue-next'
import type { Database } from '~/supabase';

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true
  },
  blog: {
    type: Object as () => {
      title: string;
      subtitle: string;
      content: string;
      id: string;
      featured_image_url: string;
      tags: string[]
    },
    required: true
  }
});
const emit = defineEmits(['update:open'])
const client = useSupabaseClient<Database>()
const isPublishing = ref(false)
const title = ref(props.blog.title)
const subtitle = ref(props.blog.subtitle)
const tags = ref<string[]>(props.blog.tags || [])
const originalTags = ref<string[]>([...props.blog.tags || []])
const preview_img = ref<string | null>(null)
const preview_file = ref<File | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)
const titlePlaceholder = "Enter your preview title";
const subtitlePlaceholder = "Enter your preview subtitle...";
const categories_id = ref()

// Update the title based on input
const updateTitle = (event: Event) => {
  const target = event.target as HTMLElement;
  title.value = target.innerText;
};

const updateSubtitle = (event: Event) => {
  const target = event.target as HTMLElement;
  subtitle.value = target.innerText;
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

const handleImageUpload = (event: Event) => {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if(!file) return;
  if (file) {
    const reader = new FileReader();
    reader.onloadend = () => {
      preview_img.value = reader.result as string;
    };
    reader.readAsDataURL(file);
  }
  preview_file.value = file
};

const removepreview_img = () => {
  preview_img.value = null
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const handlePublish = async () => {
  try {
    isPublishing.value = true;

    // Upload image to Supabase if a new file is selected
    if (preview_file.value) {
      const fileName = `avatar_${Date.now()}.png`;
      const { error: uploadError } = await client.storage
        .from("story_preview")
        .upload(fileName, preview_file.value);

      if (uploadError) {
        console.error("Error uploading avatar:", uploadError);
        return;
      }

      const { data: { publicUrl } } = client.storage
        .from("story_preview")
        .getPublicUrl(fileName);

      preview_img.value = publicUrl;
    }

    const updatedFeaturedImage = preview_img.value || props.blog.featured_image_url;

    // Find added and removed tags
    const addedTags = tags.value.filter(tag => !originalTags.value.includes(tag));
    const removedTags = originalTags.value.filter(tag => !tags.value.includes(tag));

    // Handle removed tags - decrease post_length
    for (const tag of removedTags) {
      const slug = tag.toLowerCase().replace(/\s+/g, "-");
      const { data: category } = await client
        .from("categories")
        .select("*")
        .eq("slug", slug)
        .single();

      if (category) {
        await client
          .from("categories")
          .update({ post_length: category.post_length! - 1 })
          .eq("id", category.id);
      }
    }

    // Handle added tags - increase post_length or create new
    for (const tag of addedTags) {
      const slug = tag.toLowerCase().replace(/\s+/g, "-");
      const { data: existingCategory } = await client
        .from("categories")
        .select("*")
        .eq("slug", slug)
        .single();

      if (existingCategory) {
        await client
          .from("categories")
          .update({ post_length: existingCategory.post_length! + 1 })
          .eq("id", existingCategory.id);
      } else {
        const { data: newCategory } = await client
          .from("categories")
          .insert({
            name: tag,
            slug: slug,
            post_length: 1,
          })
          .select()
          .single();

        if (newCategory) {
          categories_id.value = newCategory.id;
        }
      }
    }

    // Update the blog post
    const { error: updateError } = await client
      .from("blog_posts")
      .update({
        title: title.value,
        subtitle: subtitle.value,
        featured_image_url: updatedFeaturedImage,
        tags: [...new Set(tags.value)],
        status: "posted",
      })
      .eq("id", props.blog.id);

    if (updateError) {
      throw updateError;
    }

    // Insert into post_categories table if we have a new category
    if (categories_id.value) {
      await client
        .from("post_categories")
        .insert({
          post_id: props.blog.id,
          category_id: categories_id.value,
        });
    }

    navigateTo('/', { external: true })
  } catch (error) {
    console.error("Error during publish:", error);
  } finally {
    isPublishing.value = false;
  }
};

const handleCancel = () => {
  emit('update:open', false)
}

const handleUpdateOpen = (val: boolean) => {
  emit('update:open', val)
}
</script>

<template>
  <div>
    <Dialog :open="isOpen" @update:open="handleUpdateOpen" class="bg-white dark:bg-foreground w-full h-full z-50">
      <div class="px-4 max-w-screen-xl mx-auto md:px-8">
        <DialogContent class="max-w-full h-full bg-white dark:bg-foreground">
          <div class="flex flex-col md:flex-row items-center gap-6 py-4">
            <div class="w-full md:w-1/2 space-y-4">
              <div class="space-y-2">
                <Label for="cover-image" class="text-black dark:text-white">Story Preview</Label>
                <div v-if="preview_img" class="relative aspect-video overflow-hidden rounded-lg">
                  <img :src="preview_img !== null ? preview_img : props.blog.featured_image_url" alt="Cover image" class="object-cover w-full h-full" />
                  <Button size="icon" variant="secondary" class="absolute right-2 top-2" @click="removepreview_img">
                    <X class="h-4 w-4" />
                  </Button>
                </div>
                <div v-else class="flex items-center justify-center aspect-video border-2 border-dashed rounded-lg">
                  <Label for="cover-image" class="cursor-pointer">
                    <div class="flex flex-col items-center gap-2">
                      <ImageIcon class="h-8 w-8 text-muted-foreground" />
                      <span class="text-sm text-muted-foreground">Upload cover image</span>
                    </div>
                  </Label>
                </div>
                <Input ref="fileInput" id="cover-image" type="file" accept="image/*" class="sr-only"
                  @change="handleImageUpload" />
              </div>
            </div>
            <div class="w-full md:w-1/2 space-y-4">
              <div class="space-y-2">
                <Label for="title" class="text-black dark:text-white">Title</Label>
                <p id="title" contenteditable="true"
                  class="border-b dark:border-b-white dark:text-white dark:placeholder:text-white px-2 py-1 outline-none"
                  v-text="title" placeholder="Write a review title" @input="updateTitle($event)"
                  :class="{ 'titlePlaceholder': !title.trim() }" @focus="handleFocus" @blur="handleBlur"></p>
              </div>
              <div class="space-y-2">
                <Label for="subtitle" class="text-black dark:text-white">Subtitle</Label>
                <p id="subtitle" contenteditable="true"
                  class="border-b dark:border-b-white dark:text-white dark:placeholder:text-white px-2 py-1 outline-none"
                  v-text="subtitle" placeholder="Write a preview subtitle..." @input="updateSubtitle($event)"
                  :class="{ 'subtitlePlaceholder': !subtitle.trim() }" @focus="handleFocus" @blur="handleBlur"></p>
              </div>
              <div class="space-y-2">
                <Label for="tags" class="text-black dark:text-white">Tags</Label>
                <TagsInput v-model="tags" class="w-full">
                  <TagsInputItem v-for="item in tags" :key="item" :value="item">
                    <TagsInputItemText />
                    <TagsInputItemDelete />
                  </TagsInputItem>
                  <TagsInputInput placeholder="Add a Categories..." />
                </TagsInput>
              </div>
              <div class="flex items-center">
                <Button variant="outline" @click="handleCancel" class="mt-10 p-5">
                  Cancel
                </Button>
                <Button @click="handlePublish" :disabled="isPublishing" class="mt-10 ml-2 p-5">
                  <Loader2 v-if="isPublishing" class="h-4 w-4 animate-spin" />
                  {{ isPublishing ? 'Publishing' : 'Publish' }}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </div>
    </Dialog>
  </div>
</template>

<style scoped>
.placeholder {
  color: #a1a1a1;
}

#title:empty:before {
  content: attr(placeholder);
  color: #a1a1a1;
}

#subtitle:empty:before {
  content: attr(placeholder);
  color: #a1a1a1;
}
</style>