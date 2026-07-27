<script lang="ts">
    type Props = {
        label?: string;
        isLink?: boolean;
        href?: string;
        className?: string;
    };
    let { label, isLink = false, href = "#", className }: Props = $props();
</script>

{#if isLink}
    <a
        {href}
        target="_blank"
        class="block px-4 py-2 cursor-pointer text-lg bg-orange text-white hover:bg-orange/80 {className}"
    >
        {label ?? "Link"}
    </a>
{:else}
    <button
        type="button"
        class="block px-4 py-2 cursor-pointer text-lg bg-orange text-white hover:bg-orange/80 {className}"
    >
        {label ?? "Button"}
    </button>
{/if}
