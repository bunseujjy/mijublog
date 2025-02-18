<script setup lang="ts">
import { ref } from "vue";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Loader2 } from "lucide-vue-next";
import contact from "~/server/app/contact";
import type { ContactFormData } from "~/server/app/types/emailTypes";

const { toast } = useToast();

const form = ref<ContactFormData>({
  name: "",
  email: "",
  subject: "",
  message: "",
});

const isSubmitting = ref(false);
const { user: currentUser } =useAuth();

const handleSubmit = async () => {
  isSubmitting.value = true;

  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 2000));
  const data = await contact(form.value, currentUser.value);

  if (data) {
    form.value = { name: "", email: "", subject: "", message: "" };
    isSubmitting.value = false;
  }
  // Reset form and show success message

  toast({
    title: "Message Sent",
    description: "We've received your message and will get back to you soon.",
  });
};

useSeoMeta({
  title: "Contact",
  ogTitle: "Contact",
  ogUrl: `${import.meta.env.VITE_BASE_URL}/contact`,
  twitterTitle: "Contact",
});
</script>

<template>
  <div class="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md mx-auto bg-card shadow-lg rounded-lg overflow-hidden">
      <div class="px-6 py-8">
        <h2 class="text-3xl font-bold text-center text-foreground mb-6">
          Contact Us
        </h2>
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <div>
            <Label for="name" class="pb-2">Name</Label>
            <Input
              id="name"
              v-model="form.name"
              type="text"
              placeholder="Your Name"
              required
            />
          </div>
          <div>
            <Label for="email" class="pb-2">Email</Label>
            <Input
              id="email"
              v-model="form.email"
              type="email"
              placeholder="your@email.com"
              required
            />
          </div>
          <div>
            <Label for="subject" class="pb-2">Subject</Label>
            <Input
              id="subject"
              v-model="form.subject"
              type="text"
              placeholder="Message Subject"
              required
            />
          </div>
          <div>
            <Label for="message" class="pb-2">Message</Label>
            <Textarea
              id="message"
              v-model="form.message"
              placeholder="Your message here..."
              required
            />
          </div>
          <Button
            type="submit"
            class="w-full text-white py-4"
            :disabled="isSubmitting"
          >
            <Mail v-if="!isSubmitting" class="mr-2 h-4 w-4" />
            <Loader2 v-else class="mr-2 h-4 w-4 animate-spin" />
            {{ isSubmitting ? "Sending..." : "Send Message" }}
          </Button>
        </form>
      </div>
    </div>
  </div>
</template>
