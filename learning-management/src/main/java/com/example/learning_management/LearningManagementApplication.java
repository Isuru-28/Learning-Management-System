package com.example.learning_management;

import com.example.learning_management.entity.user.Role;
import com.example.learning_management.repository.RoleRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableJpaAuditing
@EnableAsync
public class LearningManagementApplication {

	public static void main(String[] args) {
		SpringApplication.run(LearningManagementApplication.class, args);
	}

	@Bean
	public CommandLineRunner initializeRoles(RoleRepository roleRepository) {
		return args -> {
			if(roleRepository.findByName("STUDENT").isEmpty()) {
				roleRepository.save(Role.builder().name("STUDENT").build());
			}
			if(roleRepository.findByName("ADMIN").isEmpty()) {
				roleRepository.save(Role.builder().name("ADMIN").build());
			}
			if(roleRepository.findByName("INSTRUCTOR").isEmpty()) {
				roleRepository.save(Role.builder().name("INSTRUCTOR").build());
			}
		};
	}

}
