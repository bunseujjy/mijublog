<script setup lang="ts">
    import { ref, onMounted, onUnmounted } from "vue";
    import { QuillEditor } from "@vueup/vue-quill";
    import "@vueup/vue-quill/dist/vue-quill.snow.css";
    import Quill from "quill";
    // @ts-ignore
    import ImageResize from "quill-image-resize";
    import { BoldIcon, ItalicIcon, LinkIcon } from "lucide-vue-next";
    import type { Session, User } from "@supabase/supabase-js";
    import type { Database } from "~/supabase";
import { useToast } from "vue-toastification";
    Quill.register("modules/imageResize", ImageResize);

    const props = defineProps<{
        user: User | undefined,
    }>()
    const emit = defineEmits(['cancelEditing'])
    const client = useSupabaseClient<Database>();
    const toast = useToast();
    const currentUser = ref<any>();
    const editor = ref<InstanceType<typeof QuillEditor> | null>(null);
    const content = ref("");
    const showFloatingToolbar = ref<boolean | null>(false);
    const editorOptions = {
        theme: 'snow',
        modules: {
            toolbar: {
                container: [
                    [{ header: [1, 2, 3, false] }],
                    ['bold', 'italic', 'underline', 'strike'],
                    [{ list: 'ordered' }, { list: 'bullet' }],
                    [{ align: [] }],
                    ['link', 'image'],
                    ['clean']
                ],
                handlers: {
                    image: function () {
                        const input = document.createElement('input')
                        input.setAttribute('type', 'file')
                        input.setAttribute('accept', 'image/*')
                        input.click()

                        input.onchange = async () => {
                            const file = input.files?.[0]
                            if (!file) return

                            const imageUrl = await uploadImage(file)
                            if (!imageUrl) return

                            const quill = editor.value?.getQuill()
                            const range = quill?.getSelection()
                            if (quill && range) {
                                quill.insertEmbed(range.index, 'image', imageUrl)
                            }
                        }
                    }
                }
            },
            imageResize: {
                displaySize: true,
                modules: ['Resize', 'DisplaySize', 'Toolbar']
            }
        },
        placeholder: 'Start writing...'
    }

    const formatText = (format: string) => {
        const quill = editor.value?.getQuill();
        if (quill) {
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
        }
    };

    // Handle image upload
    const uploadImage = async (file: File): Promise<string | null> => {
        const filePath = `profile_description_img/${Date.now()}-${file.name}`

        const { error: uploadError } = await client.storage
            .from('profile_description_img')
            .upload(filePath, file)

        if (uploadError) {
            console.error('Error uploading img:', uploadError.message)
            return null
        }

        const { data: publicUrlData } = client.storage
            .from('profile_description_img')
            .getPublicUrl(filePath)

        return publicUrlData?.publicUrl || null
    }

    // Publish story
    const publishStory = async () => {
        const quillEditor = editor.value?.getQuill();
        const contentHtml = quillEditor ? quillEditor.root.innerHTML : "";
        content.value = contentHtml;

        if (!content.value) {
            console.error("Content is missing");
            return;
        }

        const { data, error } = await client.auth.updateUser({
            data: {
                description: contentHtml
            }
        })

        if (error) {
            console.error("Error inserting post:", error.message);
            return;
        }
        if (data) {
            toast.success("Successfully editing profile")
            emit('cancelEditing')
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
            quill.on("selection-change", checkSelection);
        }
        await getCurrentUser(currentUser);
        content.value = props?.user?.user_metadata.description
    });

    onUnmounted(() => {
        const quill = editor.value?.getQuill();
        if (quill) {
            quill.off("selection-change", checkSelection);
        }
    });
</script>


<template>
    <div>
        <div class="mtext-black dark:text-white shadow-lg rounded-lg overflow-hidden">
            <header class="py-4 border-b border-gray-200 flex justify-between items-center">
                <h1 class="text-xl font-semibold text-black md:text-muted">About Me</h1>
                <button @click="publishStory"
                    class="px-4 py-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition duration-300 ease-in-out">
                    Publish
                </button>
            </header>

            <div class="py-8">
                <!-- Quill Editor -->
                <div class="pt-5">
                    <QuillEditor ref="editor" :options="editorOptions" @image-added="uploadImage" content-type="html"
                        v-model="content" :content="content" placeholder="Tell your story..." style="padding-top: 20px" />
                </div>
            </div>
        </div>

        <transition name="fade">
            <div v-if="showFloatingToolbar"
                class="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-white rounded-full shadow-lg px-4 py-2">
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

    .fade-enter-active,
    .fade-leave-active {
        transition: opacity 0.3s;
    }

    .fade-enter-from,
    .fade-leave-to {
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