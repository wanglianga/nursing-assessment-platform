package com.nursing.service;

import com.nursing.entity.Elder;
import com.nursing.entity.ElderStatus;
import com.nursing.entity.NursingLevel;
import com.nursing.repository.ElderRepository;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ElderService {

    private final ElderRepository elderRepository;

    public ElderService(ElderRepository elderRepository) {
        this.elderRepository = elderRepository;
    }

    public List<Elder> findAll() {
        return elderRepository.findAll();
    }

    public Elder findById(Long id) {
        return elderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("老人信息未找到: " + id));
    }

    public Elder create(Elder elder) {
        return elderRepository.save(elder);
    }

    public Elder update(Long id, Elder elder) {
        Elder existing = findById(id);
        existing.setName(elder.getName());
        existing.setGender(elder.getGender());
        existing.setAge(elder.getAge());
        existing.setIdCard(elder.getIdCard());
        existing.setAdmissionDate(elder.getAdmissionDate());
        existing.setNursingLevel(elder.getNursingLevel());
        existing.setContactName(elder.getContactName());
        existing.setContactPhone(elder.getContactPhone());
        existing.setStatus(elder.getStatus());
        existing.setAllergies(elder.getAllergies());
        existing.setChronicDiseases(elder.getChronicDiseases());
        existing.setCurrentMedications(elder.getCurrentMedications());
        return elderRepository.save(existing);
    }

    public long countByStatus(ElderStatus status) {
        return elderRepository.countByStatus(status);
    }

    public long countByNursingLevel(NursingLevel level) {
        return elderRepository.countByNursingLevel(level);
    }

    public Map<String, Object> getStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("total", elderRepository.count());

        Map<String, Long> byLevel = new HashMap<>();
        for (NursingLevel level : NursingLevel.values()) {
            byLevel.put(level.name(), countByNursingLevel(level));
        }
        stats.put("byLevel", byLevel);

        Map<String, Long> byStatus = new HashMap<>();
        for (ElderStatus status : ElderStatus.values()) {
            byStatus.put(status.name(), countByStatus(status));
        }
        stats.put("byStatus", byStatus);

        return stats;
    }
}
