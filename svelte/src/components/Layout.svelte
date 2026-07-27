<script lang="ts">
    import Header from "@/components/Header.svelte";
    import Footer from "@/components/Footer.svelte";

    const { children } = $props();
</script>

<div class="container mx-auto px-4">
    <Header />
    <main>
        {@render children?.()}
    </main>
    <Footer />
</div>
