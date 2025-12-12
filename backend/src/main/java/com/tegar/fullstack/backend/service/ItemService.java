package com.tegar.fullstack.backend.service;

import com.tegar.fullstack.backend.dto.request.ItemRequest;
import com.tegar.fullstack.backend.dto.response.ItemResponse;
import com.tegar.fullstack.backend.entity.Item;
import com.tegar.fullstack.backend.exception.BusinessException;
import com.tegar.fullstack.backend.exception.NotFoundException;
import com.tegar.fullstack.backend.repository.ItemRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Transactional
public class ItemService {

    private final ItemRepository repo;

    public ItemService(ItemRepository repo) {
        this.repo = repo;
    }

    public List<ItemResponse> getAll() {
        return repo.findAll().stream().map(this::toResponse).collect(Collectors.toList());
    }

    public ItemResponse getById(Long id) {
        Item it = repo.findById(id).orElseThrow(() -> new NotFoundException("Item tidak ditemukan"));
        return toResponse(it);
    }

    public ItemResponse create(ItemRequest req) {
        long now = Instant.now().getEpochSecond();

        if (req.getDueEpoch() == null) {
            throw new BusinessException("Tanggal jatuh tempo wajib diisi.",
                    Map.of("dueEpoch", "wajib diisi (epoch seconds)"));
        }

        if (req.getDueEpoch() <= now) {
            throw new BusinessException("Tanggal jatuh tempo harus di masa depan. Silakan pilih tanggal lain.",
                    Map.of("dueEpoch", "must be future epoch (seconds)"));
        }

        Item item = Item.builder()
                .title(req.getTitle())
                .description(req.getDescription())
                .dueEpoch(req.getDueEpoch())
                .createdAtEpoch(now)
                .build();

        Item saved = repo.save(item);
        return toResponse(saved);
    }

    public ItemResponse update(Long id, ItemRequest req) {
        Item item = repo.findById(id).orElseThrow(() -> new NotFoundException("Item tidak ditemukan"));
        long now = Instant.now().getEpochSecond();

        if (req.getDueEpoch() == null) {
            throw new BusinessException("Tanggal jatuh tempo wajib diisi.",
                    Map.of("dueEpoch", "wajib diisi (epoch seconds)"));
        }

        if (req.getDueEpoch() <= now) {
            throw new BusinessException("Tanggal jatuh tempo harus di masa depan. Silakan pilih tanggal lain.",
                    Map.of("dueEpoch", "must be future epoch (seconds)"));
        }

        item.setTitle(req.getTitle());
        item.setDescription(req.getDescription());
        item.setDueEpoch(req.getDueEpoch());
        Item saved = repo.save(item);
        return toResponse(saved);
    }

    public void delete(Long id) {
        if (!repo.existsById(id)) {
            throw new NotFoundException("Item tidak ditemukan");
        }
        repo.deleteById(id);
    }

    private ItemResponse toResponse(Item item) {
        return ItemResponse.builder()
                .id(item.getId())
                .title(item.getTitle())
                .description(item.getDescription())
                .dueEpoch(item.getDueEpoch())
                .createdAtEpoch(item.getCreatedAtEpoch())
                .build();
    }
}
